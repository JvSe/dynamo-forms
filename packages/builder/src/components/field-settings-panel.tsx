import React from "react";
import {
  type Condition,
  type DynamicFieldConfig,
  getOptionValue,
  optionValueFromLabel,
} from "@jvseen/dynamo-core";
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
    <div className="dyn:flex dyn:items-center dyn:justify-between dyn:mb-3">
      <span className="dyn:text-[13px] dyn:text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "dyn:w-10 dyn:h-[22px] dyn:rounded-[11px] dyn:border-0 dyn:cursor-pointer dyn:relative dyn:shrink-0",
          checked ? "dyn:bg-primary" : "dyn:bg-muted"
        )}
      >
        <span
          className={cn(
            "dyn:absolute dyn:top-0.5 dyn:w-[18px] dyn:h-[18px] dyn:rounded-full dyn:bg-white dyn:shadow-md dyn:transition-[left] dyn:duration-200",
            checked ? "dyn:left-5" : "dyn:left-0.5"
          )}
        />
      </button>
    </div>
  );
}

const inputClass = "dyn:w-full dyn:py-2.5 dyn:px-3 dyn:rounded-lg dyn:border dyn:border-input dyn:bg-background dyn:text-foreground dyn:text-sm dyn:outline-none";

export function FieldSettingsPanel({ field, allFields, onChange, onRemove }: FieldSettingsPanelProps) {
  const updateConfig = (patch: Partial<DynamicFieldConfig["config"]> & Record<string, unknown>) => {
    onChange({
      ...field,
      config: { ...field.config, ...patch } as DynamicFieldConfig["config"],
    });
  };

  const otherFields = allFields
    .filter((f) => f.id !== field.id)
    .map((f) => ({
      id: f.id,
      label: f.config.label || f.id,
      type: f.type,
      options: f.config.options,
    }));

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
  const showOptions = ["select", "radio", "checkbox"].includes(field.type);
  const showPlaceholder = ["text", "number", "textarea"].includes(field.type);
  const showRows = field.type === "textarea";
  const showTitleText = field.type === "title";
  const showAlignment = ["radio", "checkbox", "group"].includes(field.type);
  const hasConditions = !!field.config.conditions;
  const configWithExtras = field.config as DynamicFieldConfig["config"] & {
    maxLength?: number;
  };

  return (
    <div className="dyn:p-6 dyn:flex dyn:flex-col dyn:gap-5 dyn:bg-background">
      <div className="dyn:text-sm dyn:font-semibold dyn:text-foreground">Field settings</div>

      <div>
        <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-1.5 dyn:text-muted-foreground">
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
        <div className="dyn:text-xs dyn:font-semibold dyn:mb-3 dyn:text-muted-foreground">Settings</div>
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
          <div className="dyn:mt-2">
            <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-1.5 dyn:text-muted-foreground">
              Info message text
            </label>
            <textarea
              value={field.config.description ?? ""}
              onChange={(e) => updateConfig({ description: e.target.value })}
              rows={3}
              className="dyn:w-full dyn:py-2 dyn:px-2.5 dyn:rounded-lg dyn:border dyn:border-input dyn:bg-background dyn:text-foreground dyn:text-[13px] dyn:resize-y dyn:outline-none"
            />
          </div>
        )}
      </div>

      {showAlignment && (
        <div>
          <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-2 dyn:text-muted-foreground">
            Field alignment
          </label>
          <div className="dyn:flex dyn:gap-2">
            <button
              type="button"
              onClick={() => updateConfig({ alignment: "horizontal" })}
              className={cn(
                "dyn:flex-1 dyn:py-2 dyn:px-3 dyn:text-[13px] dyn:rounded-lg dyn:border dyn:cursor-pointer",
                field.config.alignment === "horizontal"
                  ? "dyn:border-primary dyn:bg-primary/20 dyn:text-primary"
                  : "dyn:border-border dyn:bg-card dyn:text-muted-foreground"
              )}
            >
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => updateConfig({ alignment: "vertical" })}
              className={cn(
                "dyn:flex-1 dyn:py-2 dyn:px-3 dyn:text-[13px] dyn:rounded-lg dyn:border dyn:cursor-pointer",
                (field.config.alignment ?? "vertical") === "vertical"
                  ? "dyn:border-primary dyn:bg-primary/20 dyn:text-primary"
                  : "dyn:border-border dyn:bg-card dyn:text-muted-foreground"
              )}
            >
              Vertical
            </button>
          </div>
        </div>
      )}

      {showPlaceholder && (
        <div>
          <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-1.5 dyn:text-muted-foreground">
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
          <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-1.5 dyn:text-muted-foreground">
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
          <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-1.5 dyn:text-muted-foreground">
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
          <label className="dyn:block dyn:text-xs dyn:font-medium dyn:mb-2 dyn:text-muted-foreground">
            Opções
          </label>
          {(field.config.options ?? []).length === 0 ? (
            <p className="dyn:text-xs dyn:text-muted-foreground dyn:mb-2">Adicione opções abaixo. O valor será gerado automaticamente a partir do texto.</p>
          ) : null}
          {((field.config.options ?? []) as Array<{ label: string; value?: string }>).map((opt, i) => (
            <div key={i} className="dyn:flex dyn:flex-col dyn:gap-1.5 dyn:mb-3 dyn:p-3 dyn:rounded-lg dyn:border dyn:border-border dyn:bg-muted dyn:relative">
              <div className="dyn:flex dyn:flex-col dyn:gap-1">
                <span className="dyn:text-[11px] dyn:font-medium dyn:text-muted-foreground dyn:uppercase dyn:tracking-wide">Label</span>
                <input
                  type="text"
                  placeholder="Ex: Sim, Não"
                  value={opt.label}
                  onChange={(e) => {
                    const options = [...(field.config.options ?? [])] as Array<{ label: string; value?: string }>;
                    const newLabel = e.target.value;
                    const otherValues = options
                      .map((o, idx) => (idx !== i ? getOptionValue(o) : null))
                      .filter((v): v is string => v != null);
                    options[i] = {
                      label: newLabel,
                      value: optionValueFromLabel(newLabel, otherValues),
                    };
                    updateConfig({ options });
                  }}
                  className="dyn:w-full dyn:py-2 dyn:px-3 dyn:rounded-lg dyn:border dyn:border-input dyn:bg-background dyn:text-foreground dyn:text-sm dyn:outline-none"
                />
              </div>
              {(field.config.options ?? []).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const options = (field.config.options ?? []) as Array<{ label: string; value?: string }>;
                    const next = options.filter((_, idx) => idx !== i);
                    updateConfig({ options: next });
                  }}
                  className="dyn:absolute dyn:top-2 dyn:right-2 dyn:py-1 dyn:px-2 dyn:text-xs dyn:text-red-500 dyn:hover:bg-red-50 dyn:rounded dyn:border dyn:border-transparent dyn:hover:border-red-200 dyn:transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const options = (field.config.options ?? []) as Array<{ label: string; value?: string }>;
              const count = options.length + 1;
              const newLabel = `Opção ${count}`;
              const existingValues = options.map((o) => getOptionValue(o));
              updateConfig({
                options: [
                  ...options,
                  { label: newLabel, value: optionValueFromLabel(newLabel, existingValues) },
                ],
              });
            }}
            className="dyn:py-2 dyn:px-3 dyn:text-xs dyn:font-medium dyn:rounded-lg dyn:border dyn:border-dashed dyn:border-border dyn:text-muted-foreground dyn:hover:bg-muted dyn:hover:border-foreground/30 dyn:transition-colors"
          >
            + Adicionar opção
          </button>
        </div>
      )}

      {showConditions && (
        <div className="dyn:rounded-xl dyn:p-3.5 dyn:border dyn:border-border dyn:bg-muted">
          <div className="dyn:flex dyn:items-center dyn:justify-between">
            <div className="dyn:flex dyn:items-center dyn:gap-2">
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
              <span className="dyn:text-[13px] dyn:font-medium dyn:text-foreground">
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
                "dyn:relative dyn:shrink-0 dyn:border-0 dyn:cursor-pointer dyn:rounded-[11px]",
                hasConditions ? "dyn:bg-primary" : "dyn:bg-muted"
              )}
              style={{ width: 40, height: 22 }}
            >
              <span
                className={cn(
                  "dyn:absolute dyn:top-0.5 dyn:w-[18px] dyn:h-[18px] dyn:rounded-full dyn:bg-white dyn:shadow-md dyn:transition-[left] dyn:duration-200",
                  hasConditions ? "dyn:left-5" : "dyn:left-0.5"
                )}
              />
            </button>
          </div>

          {hasConditions && (
            <div className="dyn:mt-4">
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
        className="dyn:mt-2 dyn:py-2.5 dyn:px-4 dyn:text-[13px] dyn:cursor-pointer dyn:text-destructive dyn:border dyn:border-destructive/30 dyn:rounded-lg dyn:bg-destructive/10 dyn:font-medium dyn:hover:bg-destructive/20"
      >
        Remove field
      </button>
    </div>
  );
}
