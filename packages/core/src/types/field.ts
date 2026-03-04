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
    options?: Array<{ label: string; value: string }>;
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
  };
};
