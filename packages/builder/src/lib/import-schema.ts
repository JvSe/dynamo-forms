import {
  optionValueFromLabel,
  type DynamicFieldConfig,
  type FormStep,
} from "@jvseen/dynamo-core";
import { FIELD_TYPES } from "../constants/field-types.js";

const VALID_TYPES = new Set(FIELD_TYPES.map((t) => t.type));

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function ensureString(v: unknown, fallback: string): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  return fallback;
}

function ensureNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function normalizeField(raw: unknown, usedIds: Set<string>): DynamicFieldConfig | null {
  if (!isPlainObject(raw)) return null;
  const type = ensureString((raw as any).type, "text");
  if (!VALID_TYPES.has(type as DynamicFieldConfig["type"])) return null;

  const configRaw = (raw as any).config;
  const configObj = isPlainObject(configRaw) ? configRaw : {};
  const name = ensureString(configObj.name ?? configObj.label, "field");
  const label = ensureString(configObj.label ?? configObj.name ?? name, name);
  const required = Boolean(configObj.required);

  let id = ensureString((raw as any).id, "");
  if (!id || usedIds.has(id)) id = generateId("field");
  usedIds.add(id);

  const config: DynamicFieldConfig["config"] = {
    name: name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "field",
    label,
    required,
  };

  if (configObj.placeholder != null) config.placeholder = String(configObj.placeholder);
  if (configObj.reference != null) config.reference = String(configObj.reference);
  if (configObj.rows != null) config.rows = ensureNumber(configObj.rows, 3);
  if (configObj.maxSelect != null) config.maxSelect = ensureNumber(configObj.maxSelect, 0);
  if (configObj.maxFiles != null) config.maxFiles = ensureNumber(configObj.maxFiles, 5);
  if (configObj.dateType != null && ["date", "time", "datetime"].includes(String(configObj.dateType)))
    config.dateType = configObj.dateType as "date" | "time" | "datetime";
  if (configObj.titleText != null) config.titleText = String(configObj.titleText);
  if (configObj.description != null) config.description = String(configObj.description);
  if (configObj.expanded != null) config.expanded = Boolean(configObj.expanded);
  if (configObj.alignment != null && ["horizontal", "vertical"].includes(String(configObj.alignment)))
    config.alignment = configObj.alignment as "horizontal" | "vertical";
  if (configObj.step != null) config.step = ensureNumber(configObj.step, 0);
  if (configObj.weight != null) config.weight = ensureNumber(configObj.weight, 0);
  if (configObj.conditions != null && isPlainObject(configObj.conditions)) config.conditions = configObj.conditions as any;

  if (Array.isArray(configObj.options)) {
    const usedValues = new Set<string>();
    config.options = configObj.options
      .filter((o: unknown) => o !== null && typeof o === "object")
      .map((o: any) => {
        const label = typeof o.label === "string" ? o.label : String(o.value ?? "Option");
        const value =
          typeof o.value === "string" && o.value.trim()
            ? o.value
            : optionValueFromLabel(label, [...usedValues]);
        usedValues.add(value);
        return { label, value };
      });
  }

  if (type === "group" && Array.isArray(configObj.children)) {
    config.children = configObj.children
      .map((c: unknown) => normalizeField(c, usedIds))
      .filter((c: DynamicFieldConfig | null): c is DynamicFieldConfig => c !== null);
  }

  if (Array.isArray(configObj.capturas)) {
    config.capturas = configObj.capturas
      .filter((c: unknown) => isPlainObject(c))
      .map((c: any, i: number) => ({
        id: String(c.id ?? `captura-${i + 1}`),
        label: String(c.label ?? `Captura ${i + 1}`),
      }));
  }

  return { id, type: type as DynamicFieldConfig["type"], config };
}

function normalizeSteps(steps: unknown): FormStep[] {
  if (!Array.isArray(steps)) return [];
  return steps
    .filter((s) => isPlainObject(s) && (s as any).id && (s as any).title)
    .map((s: any, i) => ({
      id: String(s.id),
      title: String(s.title).trim() || `Step ${i + 1}`,
      fieldIds: Array.isArray((s as any).fieldIds) ? (s as any).fieldIds.map(String) : undefined,
    }));
}

export type ImportSchemaResult =
  | { ok: true; fields: DynamicFieldConfig[]; title?: string; steps?: FormStep[] }
  | { ok: false; error: string };

/**
 * Parse JSON string as form template and return normalized DynamicFieldConfig[].
 * Accepts:
 * - Array of field configs: [ { id, type, config }, ... ]
 * - Object (FormKit-style schema): { id?, name?, fields: [...], steps: [{ id, title, fieldIds? }] }
 */
export function parseImportSchema(jsonString: string): ImportSchemaResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { ok: false, error: "JSON inválido." };
  }

  let rawFields: unknown[] = [];
  let title: string | undefined;
  let steps: FormStep[] | undefined;

  if (Array.isArray(parsed)) {
    rawFields = parsed;
  } else if (isPlainObject(parsed) && Array.isArray((parsed as any).fields)) {
    rawFields = (parsed as any).fields;
    if (typeof (parsed as any).title === "string" && (parsed as any).title.trim()) {
      title = (parsed as any).title.trim();
    }
    if (typeof (parsed as any).name === "string" && (parsed as any).name.trim() && title == null) {
      title = (parsed as any).name.trim();
    }
    if (Array.isArray((parsed as any).steps) && (parsed as any).steps.length > 0) {
      steps = normalizeSteps((parsed as any).steps);
    }
  } else {
    return { ok: false, error: "Use um array de campos ou um objeto com \"fields\" (e opcionalmente \"steps\", \"name\")." };
  }

  const usedIds = new Set<string>();
  const fields: DynamicFieldConfig[] = [];

  for (const raw of rawFields) {
    const field = normalizeField(raw, usedIds);
    if (field) fields.push(field);
  }

  return { ok: true, fields, title, steps };
}
