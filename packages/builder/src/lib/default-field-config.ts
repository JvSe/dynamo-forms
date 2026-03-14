import {
  slugFromLabel,
  optionValueFromLabel,
  type DynamicFieldConfig,
} from "@jvseen/dynamo-core";
import type { FieldType } from "../constants/field-types.js";

export type CreateFieldOverrides = {
  defaultLabel?: string;
  defaultPlaceholder?: string;
};

function generateFieldId(type: FieldType): string {
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultFieldConfig(
  type: FieldType,
  overrides?: CreateFieldOverrides
): DynamicFieldConfig {
  const id = generateFieldId(type);
  const label = overrides?.defaultLabel ?? `Novo campo ${type}`;
  const name = slugFromLabel(label);
  const placeholder = overrides?.defaultPlaceholder;

  const base = {
    id,
    type,
    config: {
      name,
      label,
      required: false,
      ...(placeholder !== undefined && { placeholder }),
    },
  } as DynamicFieldConfig;

  switch (type) {
    case "select":
    case "radio":
    case "checkbox":
      return {
        ...base,
        config: {
          ...base.config,
          options: [
            { label: "Opção 1", value: optionValueFromLabel("Opção 1") },
            { label: "Opção 2", value: optionValueFromLabel("Opção 2", ["opcao_1"]) },
          ],
        },
      };
    case "textarea":
      return {
        ...base,
        config: { ...base.config, rows: 4 },
      };
    case "datetime":
    case "date":
    case "time":
      return {
        ...base,
        config: {
          ...base.config,
          dateType: type === "datetime" ? "datetime" : type === "date" ? "date" : "time",
        },
      };
    case "upload":
      return {
        ...base,
        config: { ...base.config, maxFiles: 5 },
      };
    case "title":
      return {
        ...base,
        config: { ...base.config, titleText: "Título da seção" },
      };
    case "group":
      return {
        ...base,
        config: { ...base.config, children: [], expanded: true },
      };
    case "mult_capturas":
      return {
        ...base,
        config: { ...base.config, capturas: [{ id: "1", label: "Captura 1" }] },
      };
    default:
      return base;
  }
}
