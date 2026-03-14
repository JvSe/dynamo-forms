import type { DynamicFieldConfig } from "./types/field.js";
import type { FormStep } from "./types/form.js";

export const findFieldInGroups = (
  fieldsToSearch: DynamicFieldConfig[],
  targetFieldId: string
): DynamicFieldConfig | undefined => {
  for (const f of fieldsToSearch) {
    if (f.id === targetFieldId) return f;
    if (f.type === "group" && f.config.children) {
      const found = findFieldInGroups(f.config.children, targetFieldId);
      if (found) return found;
    }
  }
  return undefined;
};

export const getFieldLabelById = (
  fields: DynamicFieldConfig[],
  fieldId: string
): string => {
  const field = fields.find((f) => f.id === fieldId);
  const foundField = field || findFieldInGroups(fields, fieldId);
  return foundField?.config.label || "Campo sem label";
};

export const findFirstErrorFieldId = (
  fieldsToSearch: DynamicFieldConfig[],
  errorFieldIds: string[]
): string | null => {
  for (const field of fieldsToSearch) {
    if (field.type === "group" && field.config.children) {
      const childErrorId = findFirstErrorFieldId(
        field.config.children,
        errorFieldIds
      );
      if (childErrorId) return childErrorId;
      continue;
    }
    if (field.type === "title" || field.type === "divider") continue;
    if (errorFieldIds.includes(field.id)) return field.id;
  }
  return null;
};

/**
 * Returns a copy of steps with fieldIds filled from fields (FormKit-style schema).
 * For each step index i, fieldIds = root field ids where config.step === i.
 */
export function getStepsWithFieldIds(
  steps: FormStep[],
  fields: DynamicFieldConfig[]
): FormStep[] {
  return steps.map((step, index) => {
    const fieldIds = fields
      .filter((f) => (f.config.step ?? 0) === index)
      .map((f) => f.id);
    return { ...step, fieldIds };
  });
}
