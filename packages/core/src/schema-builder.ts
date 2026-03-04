import { z } from "zod";
import type { DynamicFieldConfig } from "./types/field.js";
import { evaluateConditions } from "./utils.js";

const errorMessages = (label: string) => ({
  required: `* ${label} é obrigatório`,
  invalid: `* ${label} inválido`,
});

export const buildZodSchema = (
  fields: DynamicFieldConfig[],
  formValues: Record<string, any> = {}
) => {
  const shape: Record<string, any> = {};

  const processFields = (fieldsToProcess: DynamicFieldConfig[]) => {
    fieldsToProcess.forEach((field) => {
      if (field.type === "group" && field.config.children) {
        let shouldProcessGroup = true;
        if (field.config.conditions) {
          shouldProcessGroup = evaluateConditions(
            field.config.conditions,
            formValues,
            field.id
          );
        }
        if (shouldProcessGroup) processFields(field.config.children);
        return;
      }
      if (field.type === "title" || field.type === "divider") return;
      if (field.config.conditions) {
        const shouldInclude = evaluateConditions(
          field.config.conditions,
          formValues,
          field.id
        );
        if (!shouldInclude) return;
      }

      let base: z.ZodTypeAny;
      switch (field.type) {
        case "text": {
          let textSchema = z.string({
            required_error: errorMessages(field.config.label).required,
          });
          if (field.config.required)
            textSchema = textSchema.min(1, errorMessages(field.config.label).required);
          base = textSchema;
          break;
        }
        case "number":
          base = z
            .union([
              z.string({
                required_error: errorMessages(field.config.label).required,
              }),
              z.number({
                required_error: errorMessages(field.config.label).required,
              }),
            ])
            .refine(
              (val) => {
                if (field.config.required && (val === "" || val == null))
                  return false;
                return true;
              },
              { message: errorMessages(field.config.label).required }
            )
            .transform((val) => {
              if (val === "" || val == null) return undefined;
              const num = typeof val === "number" ? val : Number(val);
              return isNaN(num) ? undefined : num;
            })
            .refine(
              (val) =>
                field.config.required
                  ? typeof val === "number"
                  : val === undefined || typeof val === "number",
              { message: "Número inválido" }
            );
          break;
        case "boolean":
          base = z.boolean({
            required_error: errorMessages(field.config.label).required,
          });
          break;
        case "select":
        case "radio": {
          let strSchema = z.string({
            required_error: errorMessages(field.config.label).required,
          });
          if (field.config.required)
            strSchema = strSchema.min(1, errorMessages(field.config.label).required);
          base = strSchema;
          break;
        }
        case "checkbox": {
          let arrSchema = z.array(z.string(), {
            required_error: errorMessages(field.config.label).required,
          });
          if (field.config.required)
            arrSchema = arrSchema.min(1, errorMessages(field.config.label).required);
          base = arrSchema;
          break;
        }
        case "upload":
          base = z
            .union([z.string(), z.array(z.string()), z.undefined()])
            .refine(
              (val) => {
                if (!field.config.required) return true;
                if (val == null) return false;
                if (Array.isArray(val)) return val.length > 0;
                return val !== "";
              },
              { message: errorMessages(field.config.label).required }
            );
          break;
        case "datetime":
          base = z.union([z.string(), z.date()], {
            required_error: errorMessages(field.config.label).required,
          });
          if (field.config.required)
            base = base.refine(
              (val) =>
                typeof val === "string" ? val.trim() !== "" : val != null,
              { message: errorMessages(field.config.label).required }
            );
          break;
        case "signature": {
          let sigSchema = z.string({
            required_error: errorMessages(field.config.label).required,
          });
          if (field.config.required)
            sigSchema = sigSchema.min(1, errorMessages(field.config.label).required);
          base = sigSchema;
          break;
        }
        default:
          base = z.any({
            required_error: errorMessages(field.config.label).required,
          });
      }
      shape[field.id] = field.config.required ? base : base.optional();
    });
  };

  processFields(fields);
  return z.object(shape);
};
