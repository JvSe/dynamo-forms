import { useMemo, useRef } from "react";
import type { Condition } from "../types/condition.js";
import { evaluateConditions, normalizeConditions } from "../utils.js";

interface UseOptimizedConditionsProps {
  fieldId: string;
  condition: Condition | undefined;
  formValues: Record<string, any>;
  changedFieldId?: string;
  blurredFieldId?: string;
}

export function useOptimizedConditions({
  fieldId,
  condition,
  formValues,
  changedFieldId,
  blurredFieldId,
}: UseOptimizedConditionsProps) {
  const previousResult = useRef<boolean | null>(null);
  const previousRelevantValues = useRef<Record<string, any>>({});

  return useMemo(() => {
    const normalizedCondition = normalizeConditions(condition);
    if (!normalizedCondition) return true;

    const hasRelevantBlurredField =
      blurredFieldId &&
      normalizedCondition.regras.some((rule) => rule.campo === blurredFieldId);
    const hasRelevantChangedField =
      changedFieldId &&
      normalizedCondition.regras.some((rule) => rule.campo === changedFieldId);

    const relevantFields = normalizedCondition.regras.map((rule) => rule.campo);
    const currentRelevantValues: Record<string, any> = {};
    let hasRelevantValueChanged = false;
    relevantFields.forEach((campo) => {
      const currentValue = formValues[campo];
      const previousValue = previousRelevantValues.current[campo];
      currentRelevantValues[campo] = currentValue;
      if (currentValue !== previousValue) hasRelevantValueChanged = true;
    });

    const shouldReEvaluate =
      previousResult.current === null ||
      hasRelevantChangedField ||
      hasRelevantBlurredField ||
      hasRelevantValueChanged;

    if (!shouldReEvaluate && previousResult.current !== null) {
      return previousResult.current;
    }

    const result = evaluateConditions(condition, formValues, fieldId);
    previousResult.current = result;
    previousRelevantValues.current = currentRelevantValues;
    return result;
  }, [fieldId, condition, formValues, changedFieldId, blurredFieldId]);
}
