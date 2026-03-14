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
      className="dyn:fixed dyn:inset-0 dyn:z-[100] dyn:flex dyn:items-center dyn:justify-center dyn:p-4 dyn:bg-black/40"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div
        className={cn(
          "dyn:bg-white dyn:rounded-xl dyn:shadow-xl dyn:flex dyn:flex-col dyn:w-full dyn:max-w-2xl dyn:max-h-[85vh]",
          "dyn:border dyn:border-gray-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dyn:shrink-0 dyn:flex dyn:items-center dyn:justify-between dyn:px-5 dyn:py-4 dyn:border-b dyn:border-gray-200">
          <h2 id="import-modal-title" className="dyn:text-lg dyn:font-semibold dyn:text-gray-900">
            Importar template (JSON)
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="dyn:p-2 dyn:rounded-lg dyn:text-gray-500 dyn:hover:bg-gray-100 dyn:hover:text-gray-700 dyn:transition-colors"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="dyn:flex-1 dyn:min-h-0 dyn:flex dyn:flex-col dyn:gap-3 dyn:px-5 dyn:py-4">
          <p className="dyn:text-sm dyn:text-gray-500">
            Cole o schema JSON do formulário. Os campos serão validados e exibidos no canvas.
          </p>
          <div className="dyn:flex-1 dyn:min-h-0 dyn:flex dyn:flex-col">
            <textarea
              value={json}
              onChange={(e) => {
                setJson(e.target.value);
                setError(null);
              }}
              placeholder={PLACEHOLDER}
              className={cn(
                "dyn:w-full dyn:flex-1 dyn:min-h-[240px] dyn:p-3 dyn:rounded-lg dyn:border dyn:text-sm dyn:font-mono dyn:resize-y",
                "dyn:border-gray-300 dyn:bg-gray-50/50 dyn:text-gray-900 dyn:placeholder:text-gray-400",
                "dyn:focus:outline-none dyn:focus:ring-2 dyn:focus:ring-[#1a73e8] dyn:focus:border-transparent",
                error && "dyn:border-red-400 dyn:bg-red-50/30"
              )}
              spellCheck={false}
            />
            {error && (
              <p className="dyn:mt-2 dyn:text-sm dyn:text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="dyn:shrink-0 dyn:flex dyn:justify-end dyn:gap-2 dyn:px-5 dyn:py-4 dyn:border-t dyn:border-gray-200 dyn:bg-gray-50/50 dyn:rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="dyn:py-2.5 dyn:px-4 dyn:text-sm dyn:font-medium dyn:text-gray-700 dyn:bg-white dyn:border dyn:border-gray-300 dyn:rounded-lg dyn:hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="dyn:py-2.5 dyn:px-4 dyn:text-sm dyn:font-medium dyn:text-white dyn:bg-[#1a73e8] dyn:rounded-lg dyn:hover:bg-[#1557b0]"
          >
            Importar e aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
