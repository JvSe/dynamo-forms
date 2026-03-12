import type { DynamicFieldConfig } from "@jvse/dynamo-core";

function collectFields(fields: DynamicFieldConfig[]): DynamicFieldConfig[] {
  const out: DynamicFieldConfig[] = [];
  for (const field of fields) {
    out.push(field);
    if (field.type === "group" && field.config.children?.length) {
      out.push(...collectFields(field.config.children));
    }
  }
  return out;
}

/**
 * Build default values for the preview form so each field has a value (empty or type-appropriate).
 * Includes fields inside groups.
 */
export function getPreviewDefaultValues(fields: DynamicFieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  const all = collectFields(fields);
  for (const field of all) {
    switch (field.type) {
      case "boolean":
      case "checkbox":
        values[field.id] = field.type === "checkbox" ? [] : false;
        break;
      case "number":
        values[field.id] = "";
        break;
      default:
        values[field.id] = "";
    }
  }
  return values;
}
