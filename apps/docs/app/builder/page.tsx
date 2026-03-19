"use client";

import { FormBuilder } from "@jvseen/dynamo-builder";
import { getStepsWithFieldIds } from "@jvseen/dynamo-core";
import {
  DynamicForm,
  DynamicFormFields,
  DynamicFormFooter,
  DynamicFormHeader,
  DynamicFormSteps,
  DynamicFormValidationOverlay,
  type DynamicFieldConfig,
  type FormStep,
} from "@jvseen/dynamo-react";
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

const initialSteps: FormStep[] = [{ id: "step_1", title: "Step" }];

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
    <main className="dyn:px-8 dyn:py-6 dyn:max-w-[1600px] dyn:mx-auto">
      <div className="dyn:flex dyn:items-center dyn:gap-4 dyn:mb-5">
        <Link
          href="/"
          className="dyn:text-primary dyn:no-underline dyn:text-sm dyn:font-medium dyn:hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="dyn:m-0 dyn:text-2xl dyn:text-foreground">Construtor de formulários</h1>
      </div>

      <p className="dyn:text-muted-foreground dyn:mb-6 dyn:text-sm">
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
          className=""
          style={{}}
          steps={steps}
          onStepsChange={setSteps}
          multiStepEnabled={steps.length > 1}
          onMultiStepChange={(enabled: boolean) => {
            if (enabled && steps.length <= 1) setSteps([...steps, { id: `step_2_${Date.now()}`, title: "Step" }]);
            if (!enabled) setSteps(initialSteps);
          }}
        />
      </div>

      {finishedJson !== null && (
        <div ref={previewRef} className="dyn:flex dyn:flex-col dyn:gap-6">
          <section>
            <h2 className="dyn:text-lg dyn:mb-3 dyn:text-foreground">JSON gerado (schema: id, name, fields, steps)</h2>
            <textarea
              readOnly
              value={finishedJson}
              rows={16}
              className="dyn:w-full dyn:max-w-[800px] dyn:font-mono dyn:text-xs dyn:p-3 dyn:rounded-lg dyn:border dyn:border-border dyn:bg-muted dyn:text-foreground dyn:outline-none"
            />
          </section>

          {showPreview && fields.length > 0 && (
            <section>
              <h2 className="dyn:text-lg dyn:mb-3 dyn:text-foreground">Preview do formulário</h2>
              <div className="dyn:max-w-[480px] dyn:p-6 dyn:rounded-xl dyn:border dyn:border-border dyn:bg-card">
                <DynamicForm
                  fields={fields}
                  formId="builder-preview"
                  formName={formTitle}
                  steps={getStepsWithFieldIds(steps, fields)}
                  onSubmit={async ({ dados, uploads }) => {
                    // Preview only: keep it simple but visible.
                    console.log("[docs/builder] submit", { dados, uploads });
                    alert(
                      `Submitted (preview)\n\nDados: ${JSON.stringify(
                        dados,
                        null,
                        2
                      )}\n\nUploads: ${uploads.length}`
                    );
                  }}
                  formClassName="dyn:gap-8"

                >
                  <DynamicFormHeader className="dyn:mb-2" />
                  <DynamicFormSteps className="dyn:sticky dyn:top-0 dyn:bg-background" />
                  <DynamicFormFields className="dyn:px-4" gap={24} />
                  <DynamicFormFooter className="dyn:pt-4 dyn:border-t" />
                  <DynamicFormValidationOverlay className="dyn:z-50" />
                </DynamicForm>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
