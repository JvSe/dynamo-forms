import type { Condition } from "./types/condition.js";

/** Generates a URL-safe slug from a label (used as option value when not provided). */
export function slugFromLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export type OptionLike = { label: string; value?: string };

/** Returns the value for an option: explicit value or slug derived from label. */
export function getOptionValue(opt: OptionLike): string {
  return opt.value != null && opt.value !== "" ? opt.value : slugFromLabel(opt.label);
}

/**
 * Generates a unique value (slug) for an option from its label.
 * Used when persisting options so user code can reliably use opt.value.
 * @param label - The option label
 * @param excludeValues - Values already in use (e.g. other options) to avoid duplicates
 */
export function optionValueFromLabel(
  label: string,
  excludeValues: string[] = []
): string {
  const used = new Set(excludeValues);
  const base = slugFromLabel(label) || "opcao";
  let v = base;
  let n = 1;
  while (used.has(v)) {
    v = `${base}_${n}`;
    n += 1;
  }
  return v;
}

const conditionCache = new Map<string, Map<string, boolean>>();
const reverseDependencies = new Map<string, Set<string>>();

function createCacheKey(relevantValues: Record<string, any>): string {
  return Object.keys(relevantValues)
    .sort()
    .map((k) => `${k}:${relevantValues[k]}`)
    .join("|");
}

export function clearConditionCacheForField(changedFieldId: string) {
  const affectedFields = reverseDependencies.get(changedFieldId);
  if (!affectedFields) return;
  for (const fieldId of affectedFields) {
    if (conditionCache.has(fieldId)) {
      conditionCache.get(fieldId)!.clear();
    }
  }
}

export function getCachedConditionResult(
  fieldId: string,
  condition: Condition,
  formValues: Record<string, any>
): boolean | null {
  if (!condition?.regras) return null;
  const relevantValues = condition.regras.reduce((acc, rule) => {
    acc[rule.campo] = formValues[rule.campo];
    return acc;
  }, {} as Record<string, any>);
  if (!conditionCache.has(fieldId)) return null;
  const fieldCache = conditionCache.get(fieldId)!;
  const cacheKey = createCacheKey(relevantValues);
  return fieldCache.get(cacheKey) ?? null;
}

function setCachedConditionResult(
  fieldId: string,
  relevantValues: Record<string, any>,
  result: boolean
) {
  if (!conditionCache.has(fieldId)) {
    conditionCache.set(fieldId, new Map());
  }
  const fieldCache = conditionCache.get(fieldId)!;
  const cacheKey = createCacheKey(relevantValues);
  fieldCache.set(cacheKey, result);
}

export function normalizeConditions(
  conditions?: Condition
): Condition | undefined {
  if (!conditions) return undefined;
  if (!conditions.regras || conditions.regras.length === 0) return undefined;
  return conditions;
}

export function registerFieldDependency(
  fieldId: string,
  condition: Condition | undefined
) {
  const normalizedCondition = normalizeConditions(condition);
  if (!normalizedCondition?.regras) return;
  normalizedCondition.regras.forEach((rule) => {
    if (!reverseDependencies.has(rule.campo)) {
      reverseDependencies.set(rule.campo, new Set());
    }
    reverseDependencies.get(rule.campo)!.add(fieldId);
  });
}

export function evaluateConditions(
  condition: Condition | undefined,
  formValues: Record<string, any>,
  fieldId?: string
): boolean {
  const normalizedCondition = normalizeConditions(condition);
  if (!normalizedCondition) return true;

  const relevantValues = normalizedCondition.regras.reduce((acc, rule) => {
    acc[rule.campo] = formValues[rule.campo];
    return acc;
  }, {} as Record<string, any>);

  if (fieldId) {
    const cached = getCachedConditionResult(
      fieldId,
      normalizedCondition,
      formValues
    );
    if (cached !== null) return cached;
  }

  const ruleResults = normalizedCondition.regras.map((rule) => {
    const targetValue = formValues[rule.campo];
    const expectedValue = rule.valor;
    switch (rule.operador) {
      case "equals":
        return targetValue === expectedValue;
      case "notEquals":
        return targetValue !== expectedValue;
      case "contains":
        return (
          typeof targetValue === "string" &&
          typeof expectedValue === "string" &&
          targetValue.includes(expectedValue)
        );
      case "notContains":
        return (
          typeof targetValue === "string" &&
          typeof expectedValue === "string" &&
          !targetValue.includes(expectedValue)
        );
      case "isEmpty":
        return (
          targetValue === "" ||
          targetValue === null ||
          targetValue === undefined
        );
      case "isNotEmpty":
        return (
          targetValue !== "" &&
          targetValue !== null &&
          targetValue !== undefined
        );
      default:
        return true;
    }
  });

  const finalResult =
    normalizedCondition.tipo === "AND"
      ? ruleResults.every((r) => r)
      : ruleResults.some((r) => r);
  const result =
    normalizedCondition.action === "show" ? finalResult : !finalResult;

  if (fieldId) setCachedConditionResult(fieldId, relevantValues, result);
  return result;
}
