import type { DynamicFieldConfig } from "./types/field.js";

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
