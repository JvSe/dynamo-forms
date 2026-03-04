import type { Condition } from "./types/condition.js";
import type { DynamicFieldConfig } from "./types/field.js";
import { findFieldInGroups, getFieldLabelById } from "./field-helpers.js";

export type ErrorFieldInfo = {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  errorMessage: string;
  errorType: string;
  isConditional: boolean;
  controllingFields?: Array<{
    fieldId: string;
    fieldLabel: string;
    operator: string;
    expectedValue: any;
  }>;
  conditionType?: string;
  conditionAction?: string;
};

export const collectErrorFieldsInfo = (
  fields: DynamicFieldConfig[],
  errors: Record<string, any>
): ErrorFieldInfo[] => {
  return Object.keys(errors).map((fieldId) => {
    const error = errors[fieldId];
    const field = fields.find((f) => f.id === fieldId);
    const foundField = field || findFieldInGroups(fields, fieldId);
    const isConditional = !!foundField?.config.conditions;
    const controllingFields: Array<{
      fieldId: string;
      fieldLabel: string;
      operator: string;
      expectedValue: any;
    }> = [];
    if (isConditional && foundField?.config.conditions) {
      const conditions = foundField.config.conditions as Condition;
      conditions.regras?.forEach((rule) => {
        controllingFields.push({
          fieldId: rule.campo,
          fieldLabel: getFieldLabelById(fields, rule.campo),
          operator: rule.operador,
          expectedValue: rule.valor,
        });
      });
    }
    return {
      fieldId,
      fieldLabel: foundField?.config.label || "Campo sem label",
      fieldType: foundField?.type || "unknown",
      errorMessage: error?.message || "Erro de validação",
      errorType: error?.type || "validation",
      isConditional,
      controllingFields: isConditional ? controllingFields : undefined,
      conditionType: isConditional ? foundField?.config.conditions?.tipo : undefined,
      conditionAction: isConditional ? foundField?.config.conditions?.action : undefined,
    };
  });
};
