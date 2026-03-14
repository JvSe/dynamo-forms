"use client";

import React, { useState } from "react";
import { parseImportSchema } from "../lib/import-schema.js";
import { cn } from "../lib/utils.js";

const PLACEHOLDER = `Cole o JSON do formulário aqui.

Exemplo - array de campos:
[
  { "id": "f1", "type": "text", "config": { "name": "nome", "label": "Nome", "required": true } },
  { "id": "f2", "type": "text", "config": { "name": "email", "label": "E-mail", "required": true } }
]

Exemplo - objeto com fields e título:
{
  "title": "Meu formulário",
  "fields": [
    { "type": "text", "config": { "label": "Campo 1" } },
    { "type": "textarea", "config": { "label": "Observações", "rows": 4 } }
  ]
}

Objeto com steps (mesmo padrão): { "name", "fields": [...], "steps": [{ "id", "title", "fieldIds"? }] }`;

type ImportTemplateModalProps = {
  open: boolean;
  onClose: () => void;
  onImport: (
    fields: import("@jvseen/dynamo-core").DynamicFieldConfig[],
    title?: string,
    steps?: import("@jvseen/dynamo-core").FormStep[]
  ) => void;
};

export function ImportTemplateModal({ open, onClose, onImport }: ImportTemplateModalProps) {
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    const result = parseImportSchema(json);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.fields.length === 0) {
      setError("Nenhum campo válido encontrado no JSON.");
      return;
    }
    onImport(result.fields, result.title, result.steps);
    setJson("");
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setJson("");
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div
        className={cn(
          "bg-white rounded-xl shadow-xl flex flex-col w-full max-w-2xl max-h-[85vh]",
          "border border-gray-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 id="import-modal-title" className="text-lg font-semibold text-gray-900">
            Importar template (JSON)
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-3 px-5 py-4">
          <p className="text-sm text-gray-500">
            Cole o schema JSON do formulário. Os campos serão validados e exibidos no canvas.
          </p>
          <div className="flex-1 min-h-0 flex flex-col">
            <textarea
              value={json}
              onChange={(e) => {
                setJson(e.target.value);
                setError(null);
              }}
              placeholder={PLACEHOLDER}
              className={cn(
                "w-full flex-1 min-h-[240px] p-3 rounded-lg border text-sm font-mono resize-y",
                "border-gray-300 bg-gray-50/50 text-gray-900 placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent",
                error && "border-red-400 bg-red-50/30"
              )}
              spellCheck={false}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="py-2.5 px-4 text-sm font-medium text-white bg-[#1a73e8] rounded-lg hover:bg-[#1557b0]"
          >
            Importar e aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
