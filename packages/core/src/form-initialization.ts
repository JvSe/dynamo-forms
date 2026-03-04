import type { DynamicFieldConfig } from "./types/field.js";
import { evaluateConditions } from "./utils.js";

export const getInitialValuesFromRegister = (
  fields: DynamicFieldConfig[],
  registerSelected: Record<string, any>,
  currentFormValues: Record<string, any>
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  const processFields = (fieldsToProcess: DynamicFieldConfig[]) => {
    fieldsToProcess.forEach((field) => {
      if (field.type === "group" && field.config.children) {
        const combinedValues = { ...currentFormValues, ...initialValues };
        let shouldProcessGroup = true;
        if (field.config.conditions) {
          shouldProcessGroup = evaluateConditions(
            field.config.conditions,
            combinedValues,
            field.id
          );
        }
        if (shouldProcessGroup) processFields(field.config.children);
        return;
      }

      const campoBackoffice = registerSelected.campo_backoffice;
      if (campoBackoffice) {
        const fieldIdWithPrefix = `form-group-${field.id}`;
        let aprovado: { id: string; value: any } | undefined;
        if (Array.isArray(campoBackoffice)) {
          const sorted = [...campoBackoffice].sort(
            (a, b) =>
              new Date(b.data_criacao || 0).getTime() -
              new Date(a.data_criacao || 0).getTime()
          );
          const mr = sorted[0];
          if (mr?.dados_retornos?.dados_aprovados) {
            aprovado = mr.dados_retornos.dados_aprovados.find(
              (item: { id: string }) =>
                item.id === field.id || item.id === fieldIdWithPrefix
            );
          }
        } else if (
          typeof campoBackoffice === "object" &&
          "dados_retornos" in campoBackoffice &&
          (campoBackoffice as any).dados_retornos?.dados_aprovados
        ) {
          aprovado = (campoBackoffice as any).dados_retornos.dados_aprovados.find(
            (item: { id: string }) =>
              item.id === field.id || item.id === fieldIdWithPrefix
          );
        }
        if (aprovado?.value != null && aprovado.value !== "") {
          initialValues[field.id] =
            field.type === "checkbox" && typeof aprovado.value === "string"
              ? [aprovado.value]
              : aprovado.value;
          return;
        }
      }

      if (field.config.reference && registerSelected[field.config.reference]) {
        const v = registerSelected[field.config.reference];
        if (v != null && v !== "") initialValues[field.id] = v;
      }
    });
  };

  processFields(fields);
  return initialValues;
};
