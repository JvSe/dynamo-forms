import { format } from "date-fns";
import type { DynamicFieldConfig } from "./types/field.js";
import type { FormUpload } from "./types/form.js";
import { evaluateConditions } from "./utils.js";

export const processFieldsForSubmission = (
  fieldsToProcess: DynamicFieldConfig[],
  currentFormValues: Record<string, any>,
  uploads: FormUpload[],
  dados: Record<string, any>
): void => {
  for (const field of fieldsToProcess) {
    if (field.type === "group" && field.config.children) {
      let shouldProcessGroup = true;
      if (field.config.conditions) {
        shouldProcessGroup = evaluateConditions(
          field.config.conditions,
          currentFormValues,
          field.id
        );
      }
      if (shouldProcessGroup) {
        processFieldsForSubmission(
          field.config.children,
          currentFormValues,
          uploads,
          dados
        );
      }
      continue;
    }
    if (field.type === "title" || field.type === "divider") continue;
    if (field.config.conditions) {
      const shouldInclude = evaluateConditions(
        field.config.conditions,
        currentFormValues,
        field.id
      );
      if (!shouldInclude) continue;
    }

    const fieldValue = currentFormValues[field.id];
    if (field.type === "upload" && fieldValue) {
      const uris = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      const imageNames = uris.map((uri: string) => uri.split("/").pop() || uri);
      dados[field.id] = imageNames.length === 1 ? imageNames[0] : imageNames;
      uploads.push({ field_id: field.id, urls: uris });
    } else if (field.type === "datetime" && fieldValue) {
      let formattedValue: string;
      if (field.config.dateType === "datetime") {
        formattedValue = format(new Date(fieldValue), "yyyy-MM-dd'T'HH:mm");
      } else if (field.config.dateType === "date") {
        formattedValue = format(new Date(fieldValue), "yyyy-MM-dd");
      } else if (field.config.dateType === "time") {
        formattedValue = format(new Date(fieldValue), "HH:mm");
      } else {
        formattedValue = format(new Date(fieldValue), "yyyy-MM-dd");
      }
      dados[field.id] = formattedValue;
    } else if (
      fieldValue !== undefined &&
      fieldValue !== null &&
      fieldValue !== ""
    ) {
      if (!Array.isArray(fieldValue) || fieldValue.length > 0) {
        dados[field.id] = fieldValue;
      }
    }
  }
};
