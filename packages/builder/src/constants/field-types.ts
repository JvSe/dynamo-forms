import type { DynamicFieldConfig } from "@jvse/dynamo-core";

export type FieldType = DynamicFieldConfig["type"];

export const FIELD_TYPES: Array<{ type: FieldType; label: string }> = [
  { type: "text", label: "Texto" },
  { type: "number", label: "Número" },
  { type: "textarea", label: "Área de texto" },
  { type: "boolean", label: "Sim/Não" },
  { type: "checkbox", label: "Checkbox" },
  { type: "radio", label: "Opções (radio)" },
  { type: "select", label: "Seleção (select)" },
  { type: "date", label: "Data" },
  { type: "time", label: "Hora" },
  { type: "datetime", label: "Data e hora" },
  { type: "upload", label: "Upload" },
  { type: "signature", label: "Assinatura" },
  { type: "title", label: "Título" },
  { type: "divider", label: "Divisor" },
  { type: "group", label: "Grupo" },
  { type: "mult_capturas", label: "Múltiplas capturas" },
];
