import React from "react";
import type { Condition, DynamicFieldConfig } from "@jvse/dynamo-core";
import { FIELD_TYPES } from "../constants/field-types.js";
import { ConditionEditor } from "./condition-editor.js";
import { cn } from "../lib/utils.js";

const FIELD_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  FIELD_TYPES.map((t) => [t.type, t.label])
);

type FieldSettingsPanelProps = {
  field: DynamicFieldConfig;
  allFields: DynamicFieldConfig[];
  onChange: (field: DynamicFieldConfig) => void;
  onRemove: () => void;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[13px] text-gray-900">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "w-10 h-[22px] rounded-[11px] border-0 cursor-pointer relative shrink-0",
          checked ? "bg-[#1a73e8]" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[left] duration-200",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

const inputClass = "w-full py-2.5 px-3 rounded-lg border border-gray-300 text-sm outline-none";

export function FieldSettingsPanel({ field, allFields, onChange, onRemove }: FieldSettingsPanelProps) {
  const updateConfig = (patch: Partial<DynamicFieldConfig["config"]> & Record<string, unknown>) => {
    onChange({
      ...field,
      config: { ...field.config, ...patch } as DynamicFieldConfig["config"],
    });
  };

  const otherFields = allFields
    .filter((f) => f.id !== field.id)
    .map((f) => ({ id: f.id, label: f.config.label || f.id }));

  const showConditions = [
    "text",
    "number",
    "textarea",
    "boolean",
    "select",
    "radio",
    "checkbox",
    "date",
    "time",
    "datetime",
    "upload",
    "group",
  ].includes(field.type);
  const showOptions = ["select", "radio"].includes(field.type);
  const showPlaceholder = ["text", "number", "textarea"].includes(field.type);
  const showRows = field.type === "textarea";
  const showTitleText = field.type === "title";
  const showAlignment = ["radio", "checkbox", "group"].includes(field.type);
  const hasConditions = !!field.config.conditions;
  const configWithExtras = field.config as DynamicFieldConfig["config"] & {
    maxLength?: number;
  };

  return (
    <div className="p-6 flex flex-col gap-5 bg-white">
      <div className="text-sm font-semibold text-gray-900">Field settings</div>

      <div>
        <label className="block text-xs font-medium mb-1.5 text-gray-500">
          Label
        </label>
        <input
          type="text"
          value={field.type === "title" ? (field.config.titleText ?? field.config.label) : field.config.label}
          onChange={(e) =>
            field.type === "title"
              ? updateConfig({ titleText: e.target.value, label: e.target.value })
              : updateConfig({ label: e.target.value })
          }
          className={inputClass}
        />
      </div>

      <div>
        <div className="text-xs font-semibold mb-3 text-gray-500">Settings</div>
        <Toggle
          label="Required"
          checked={field.config.required}
          onChange={(v) => updateConfig({ required: v })}
        />
        {["text", "textarea"].includes(field.type) && (
          <Toggle
            label="Max character"
            checked={configWithExtras.maxLength != null && configWithExtras.maxLength > 0}
            onChange={(v) => updateConfig({ maxLength: v ? 500 : undefined } as Partial<DynamicFieldConfig["config"]>)}
          />
        )}
        <Toggle
          label="Info message"
          checked={field.config.description != null}
          onChange={(v) =>
            updateConfig({
              description: v ? field.config.description ?? "" : undefined,
            })
          }
        />
        {field.config.description != null && (
          <div className="mt-2">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">
              Info message text
            </label>
            <textarea
              value={field.config.description ?? ""}
              onChange={(e) => updateConfig({ description: e.target.value })}
              rows={3}
              className="w-full py-2 px-2.5 rounded-lg border border-gray-300 text-[13px] resize-y outline-none"
            />
          </div>
        )}
      </div>

      {showAlignment && (
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-500">
            Field alignment
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateConfig({ alignment: "horizontal" })}
              className={cn(
                "flex-1 py-2 px-3 text-[13px] rounded-lg border cursor-pointer",
                field.config.alignment === "horizontal"
                  ? "border-[#1a73e8] bg-blue-50 text-[#1a73e8]"
                  : "border-gray-300 bg-white text-gray-500"
              )}
            >
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => updateConfig({ alignment: "vertical" })}
              className={cn(
                "flex-1 py-2 px-3 text-[13px] rounded-lg border cursor-pointer",
                (field.config.alignment ?? "vertical") === "vertical"
                  ? "border-[#1a73e8] bg-blue-50 text-[#1a73e8]"
                  : "border-gray-300 bg-white text-gray-500"
              )}
            >
              Vertical
            </button>
          </div>
        </div>
      )}

      {showPlaceholder && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">
            Placeholder
          </label>
          <input
            type="text"
            value={field.config.placeholder ?? ""}
            onChange={(e) => updateConfig({ placeholder: e.target.value })}
            className={inputClass}
          />
        </div>
      )}

      {showRows && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">
            Linhas
          </label>
          <input
            type="number"
            min={2}
            value={field.config.rows ?? 4}
            onChange={(e) => updateConfig({ rows: parseInt(e.target.value, 10) || 4 })}
            className={inputClass}
          />
        </div>
      )}

      {showTitleText && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">
            Texto do título
          </label>
          <input
            type="text"
            value={field.config.titleText ?? ""}
            onChange={(e) => updateConfig({ titleText: e.target.value })}
            className={inputClass}
          />
        </div>
      )}

      {showOptions && (
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-500">
            Opções
          </label>
          {(field.config.options ?? []).length === 0 ? (
            <p className="text-xs text-gray-500 mb-2">No options. Add one below.</p>
          ) : null}
          {((field.config.options ?? []) as Array<{ label: string; value: string }>).map((opt, i) => (
            <div key={i} className="flex flex-col gap-1.5 mb-3 p-3 rounded-lg border border-gray-200 bg-gray-50 relative">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Label</span>
                <input
                  type="text"
                  placeholder="Label"
                  value={opt.label}
                  onChange={(e) => {
                    const options = [...(field.config.options ?? [])] as Array<{ label: string; value: string }>;
                    options[i] = { ...options[i], label: e.target.value };
                    updateConfig({ options });
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Value</span>
                <input
                  type="text"
                  placeholder="Value"
                  value={opt.value}
                  onChange={(e) => {
                    const options = [...(field.config.options ?? [])] as Array<{ label: string; value: string }>;
                    options[i] = { ...options[i], value: e.target.value };
                    updateConfig({ options });
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none bg-white"
                />
              </div>
              {(field.config.options ?? []).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const options = (field.config.options ?? []) as Array<{ label: string; value: string }>;
                    const next = options.filter((_, idx) => idx !== i);
                    updateConfig({ options: next });
                  }}
                  className="absolute top-2 right-2 py-1 px-2 text-xs text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const options = (field.config.options ?? []) as Array<{ label: string; value: string }>;
              const count = options.length + 1;
              const newOption = { label: `Opção ${count}`, value: `opcao_${count}` };
              updateConfig({ options: [...options, newOption] });
            }}
            className="py-2 px-3 text-xs font-medium rounded-lg border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            + Add option
          </button>
        </div>
      )}

      {showConditions && (
        <div className="rounded-xl p-3.5 border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5f6368"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-[13px] font-medium text-gray-900">
                Show conditionally
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hasConditions}
              onClick={() => {
                if (hasConditions) {
                  updateConfig({ conditions: undefined });
                } else {
                  updateConfig({
                    conditions: {
                      action: "show",
                      tipo: "AND",
                      regras: [
                        {
                          campo: otherFields[0]?.id ?? "",
                          operador: "equals",
                          valor: "",
                        },
                      ],
                    } as Condition,
                  });
                }
              }}
              className={cn(
                "relative shrink-0 border-0 cursor-pointer rounded-[11px]",
                hasConditions ? "bg-[#1a73e8]" : "bg-gray-300"
              )}
              style={{ width: 40, height: 22 }}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[left] duration-200",
                  hasConditions ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>

          {hasConditions && (
            <div className="mt-4">
              <ConditionEditor
                value={field.config.conditions}
                onChange={(c) => updateConfig({ conditions: c })}
                fields={otherFields}
              />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="mt-2 py-2.5 px-4 text-[13px] cursor-pointer text-red-600 border border-red-100 rounded-lg bg-red-100 font-medium"
      >
        Remove field
      </button>
    </div>
  );
}
