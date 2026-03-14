import React from "react";
import type { Condition, ConditionRule, Operator } from "@jvseen/dynamo-core";
import { getOptionValue } from "@jvseen/dynamo-core";

const OPERATORS: Array<{ value: Operator; label: string }> = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Does not contain" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

export type ConditionEditorField = {
  id: string;
  label: string;
  type?: string;
  options?: Array<{ label: string; value?: string }>;
};

type ConditionEditorProps = {
  value: Condition | undefined;
  onChange: (condition: Condition | undefined) => void;
  fields: ConditionEditorField[];
};

export function ConditionEditor({ value, onChange, fields }: ConditionEditorProps) {
  const condition = value ?? {
    action: "show" as const,
    tipo: "AND" as const,
    regras: [] as ConditionRule[],
  };

  const update = (patch: Partial<Condition>) => {
    onChange({ ...condition, ...patch });
  };

  const setRule = (index: number, patch: Partial<ConditionRule>) => {
    const regras = [...(condition.regras ?? [])];
    regras[index] = { ...regras[index], ...patch } as ConditionRule;
    update({ regras });
  };

  const addRule = () => {
    update({
      regras: [
        ...(condition.regras ?? []),
        { campo: fields[0]?.id ?? "", operador: "equals", valor: "" },
      ],
    });
  };

  const removeRule = (index: number) => {
    const regras = condition.regras?.filter((_, i) => i !== index) ?? [];
    update({ regras });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {(condition.regras ?? []).map((rule, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              When field
            </label>
            <select
              value={rule.campo}
              onChange={(e) => setRule(index, { campo: e.target.value })}
              className="w-full py-2.5 px-3 rounded-lg border border-gray-300 text-sm outline-none cursor-pointer bg-white text-gray-900"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label || f.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              Operator
            </label>
            <select
              value={rule.operador}
              onChange={(e) => setRule(index, { operador: e.target.value as Operator })}
              className="w-full py-2.5 px-3 rounded-lg border border-gray-300 text-sm outline-none cursor-pointer bg-white text-gray-900"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {rule.operador !== "isEmpty" && rule.operador !== "isNotEmpty" && (() => {
            const selectedField = fields.find((f) => f.id === rule.campo);
            const isOptionField = selectedField && ["radio", "checkbox"].includes(selectedField.type ?? "");
            const optionValues = isOptionField && selectedField.options?.length
              ? selectedField.options.map((opt) => ({ value: getOptionValue(opt), label: opt.label }))
              : [];

            return (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  Value
                </label>
                {optionValues.length > 0 ? (
                  <select
                    value={rule.valor ?? ""}
                    onChange={(e) => setRule(index, { valor: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg border border-gray-300 text-sm outline-none cursor-pointer bg-white text-gray-900"
                  >
                    <option value="">Selecione uma opção...</option>
                    {optionValues.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={rule.valor ?? ""}
                    onChange={(e) => setRule(index, { valor: e.target.value })}
                    placeholder="Enter value..."
                    className="w-full py-2.5 px-3 rounded-lg border border-gray-300 text-sm outline-none bg-white text-gray-900"
                  />
                )}
              </div>
            );
          })()}

          {(condition.regras?.length ?? 0) > 1 && (
            <button
              type="button"
              onClick={() => removeRule(index)}
              className="self-end py-1 px-2.5 text-xs cursor-pointer rounded-md border border-red-100 bg-red-50 text-red-600 font-medium"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {fields.length > 0 && (
        <button
          type="button"
          onClick={addRule}
          className="self-start py-1.5 px-3 text-xs font-medium cursor-pointer rounded-lg border border-dashed border-gray-300 text-[#1a73e8] bg-white hover:bg-blue-50"
        >
          + Add condition
        </button>
      )}
    </div>
  );
}
