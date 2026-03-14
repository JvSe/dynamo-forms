"use client";

import type { DynamicFieldConfig, FormStep } from "@jvseen/dynamo-builder";
import { FormBuilder } from "@jvseen/dynamo-builder";
import { getStepsWithFieldIds } from "@jvseen/dynamo-core";
import { DynamicForm } from "@jvseen/dynamo-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dynamo-forms-builder-draft";

type StoredDraft = {
  fields: DynamicFieldConfig[];
  formTitle: string;
  steps: FormStep[];
};

function loadDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as StoredDraft).fields) &&
      typeof (parsed as StoredDraft).formTitle === "string" &&
      Array.isArray((parsed as StoredDraft).steps)
    ) {
      return parsed as StoredDraft;
    }
  } catch {
    // ignore invalid or old data
  }
  return null;
}

function saveDraft(draft: StoredDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

const initialSteps: FormStep[] = [{ id: "step_1", title: "Step 1" }];

export default function BuilderTestPage() {
  const router = useRouter();
  const [fields, setFields] = useState<DynamicFieldConfig[]>([]);
  const [formTitle, setFormTitle] = useState("Drafts/ Resignation form");
  const [steps, setSteps] = useState<FormStep[]>(initialSteps);
  const [finishedJson, setFinishedJson] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFields(draft.fields);
      setFormTitle(draft.formTitle);
      setSteps(draft.steps.length > 0 ? draft.steps : initialSteps);
    }
    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;
    saveDraft({ fields, formTitle, steps });
  }, [hasLoadedDraft, fields, formTitle, steps]);

  const handleFinish = (value: DynamicFieldConfig[]) => {
    const schema = {
      id: `form_${Date.now()}`,
      name: formTitle,
      fields: value,
      steps: getStepsWithFieldIds(steps, value),
    };
    setFinishedJson(JSON.stringify(schema, null, 2));
    setShowPreview(true);
  };

  const handlePreview = () => {
    setShowPreview(true);
    setFinishedJson(JSON.stringify(fields, null, 2));
    setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <main style={{ padding: "1.5rem 2rem", maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          href="/"
          style={{ color: "#1a73e8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
        >
          ← Voltar
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, color: "#202124" }}>Construtor de formulários</h1>
      </div>

      <p style={{ color: "#5f6368", marginBottom: 24, fontSize: 14 }}>
        Arraste os componentes da esquerda para o centro, configure no painel da direita. Use Preview para visualizar e Publish para gerar o JSON.
      </p>

      <div style={{ marginBottom: 24 }}>
        <FormBuilder
          value={fields}
          onChange={setFields}
          onFinish={handleFinish}
          formTitle={formTitle}
          onFormTitleChange={setFormTitle}
          onPreview={handlePreview}
          onBack={() => router.back()}
          steps={steps}
          onStepsChange={setSteps}
          multiStepEnabled={steps.length > 1}
          onMultiStepChange={(enabled) => {
            if (enabled && steps.length <= 1) setSteps([...steps, { id: `step_2_${Date.now()}`, title: "Step 2" }]);
            if (!enabled) setSteps(initialSteps);
          }}
        />
      </div>

      {finishedJson !== null && (
        <div ref={previewRef} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>JSON gerado (schema: id, name, fields, steps)</h2>
            <textarea
              readOnly
              value={finishedJson}
              rows={16}
              style={{
                width: "100%",
                maxWidth: 800,
                fontFamily: "monospace",
                fontSize: 12,
                padding: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            />
          </section>

          {showPreview && fields.length > 0 && (
            <section>
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>Preview do formulário</h2>
              <div
                style={{
                  maxWidth: 480,
                  padding: 24,
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <DynamicForm
                  fields={fields}
                  formId="preview-form"
                  formName="Preview"
                  steps={steps.length > 1 ? steps : undefined}
                  onSubmit={({ dados, uploads }) => {
                    console.log("Submit preview:", { dados, uploads });
                    alert("Dados do preview:\n" + JSON.stringify(dados, null, 2));
                  }}
                />
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
