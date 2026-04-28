import type { Condition } from "./condition.js";

export type DynamicFieldConfig = {
  id: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "select"
    | "upload"
    | "signature"
    | "textarea"
    | "radio"
    | "checkbox"
    | "datetime"
    | "date"
    | "time"
    | "title"
    | "divider"
    | "group"
    | "mult_capturas";
  config: {
    name: string;
    label: string;
    required: boolean;
    reference?: string;
    placeholder?: string;
    options?: Array<{ label: string; value?: string }>;
    conditions?: Condition;
    rows?: number;
    maxSelect?: number;
    maxFiles?: number;
    dateType?: "date" | "time" | "datetime";
    titleText?: string;
    description?: string;
    expanded?: boolean;
    children?: DynamicFieldConfig[];
    capturas?: Array<{ id: string; label: string }>;
    /** Layout of options/children: horizontal (row) or vertical (column). Used by radio, checkbox, group. */
    alignment?: "horizontal" | "vertical";
    /** Which step this field belongs to (0-based index). undefined = step 0. */
    step?: number;
    /** Optional field weight used for score calculations. */
    weight?: number;
    /**
     * Semantic input type for text fields — enables automatic masking/formatting.
     * - "document": CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)
     * - "zipcode": CEP (00000-000)
     * - "phone": Telefone ((00) 00000-0000)
     * - "default": plain text, no mask
     */
    semanticType?: "document" | "zipcode" | "phone" | "default";
  };
};
