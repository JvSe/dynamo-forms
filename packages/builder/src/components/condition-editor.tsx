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
    <div className="dyn:flex dyn:flex-col dyn:gap-2.5">
      {(condition.regras ?? []).map((rule, index) => (
        <div
          key={index}
          className="dyn:flex dyn:flex-col dyn:gap-3 dyn:rounded-lg dyn:border dyn:border-border dyn:bg-card dyn:p-3"
        >
          <div className="dyn:flex dyn:flex-col dyn:gap-1.5">
            <label className="dyn:text-[11px] dyn:font-medium dyn:text-muted-foreground dyn:uppercase dyn:tracking-wide">
              When field
            </label>
            <select
              value={rule.campo}
              onChange={(e) => setRule(index, { campo: e.target.value })}
              className="dyn:w-full dyn:py-2.5 dyn:px-3 dyn:rounded-lg dyn:border dyn:border-input dyn:text-sm dyn:outline-none dyn:cursor-pointer dyn:bg-background dyn:text-foreground"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label || f.id}
                </option>
              ))}
            </select>
          </div>

          <div className="dyn:flex dyn:flex-col dyn:gap-1.5">
            <label className="dyn:text-[11px] dyn:font-medium dyn:text-muted-foreground dyn:uppercase dyn:tracking-wide">
              Operator
            </label>
            <select
              value={rule.operador}
              onChange={(e) => setRule(index, { operador: e.target.value as Operator })}
              className="dyn:w-full dyn:py-2.5 dyn:px-3 dyn:rounded-lg dyn:border dyn:border-input dyn:text-sm dyn:outline-none dyn:cursor-pointer dyn:bg-background dyn:text-foreground"
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
              <div className="dyn:flex dyn:flex-col dyn:gap-1.5">
                <label className="dyn:text-[11px] dyn:font-medium dyn:text-muted-foreground dyn:uppercase dyn:tracking-wide">
                  Value
                </label>
                {optionValues.length > 0 ? (
                  <select
                    value={rule.valor ?? ""}
                    onChange={(e) => setRule(index, { valor: e.target.value })}
                    className="dyn:w-full dyn:py-2.5 dyn:px-3 dyn:rounded-lg dyn:border dyn:border-input dyn:text-sm dyn:outline-none dyn:cursor-pointer dyn:bg-background dyn:text-foreground"
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
                    className="dyn:w-full dyn:py-2.5 dyn:px-3 dyn:rounded-lg dyn:border dyn:border-input dyn:text-sm dyn:outline-none dyn:bg-background dyn:text-foreground"
                  />
                )}
              </div>
            );
          })()}

          {(condition.regras?.length ?? 0) > 1 && (
            <button
              type="button"
              onClick={() => removeRule(index)}
              className="dyn:self-end dyn:py-1 dyn:px-2.5 dyn:text-xs dyn:cursor-pointer dyn:rounded-md dyn:border dyn:border-red-100 dyn:bg-red-50 dyn:text-red-600 dyn:font-medium"
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
          className="dyn:self-start dyn:py-1.5 dyn:px-3 dyn:text-xs dyn:font-medium dyn:cursor-pointer dyn:rounded-lg dyn:border dyn:border-dashed dyn:border-border dyn:text-primary dyn:bg-transparent dyn:hover:bg-primary/10"
        >
          + Add condition
        </button>
      )}
    </div>
  );
}
