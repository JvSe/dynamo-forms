import { useMemo, useRef } from "react";
import type { Condition } from "../types/condition.js";
import {
  evaluateEffectiveFieldVisibility,
  evaluateNormalizedConditions,
  normalizeConditions,
} from "../utils.js";

interface UseOptimizedConditionsProps {
  fieldId: string;
  condition: Condition | undefined;
  formValues: Record<string, any>;
  /**
   * Campos relevantes pré-computados (opcional).
   * Se omitido, são extraídos das `regras` da condição.
   */
  relevantFields?: string[];
  changedFieldId?: string;
  blurredFieldId?: string;
  /**
   * Incrementado externamente para forçar reavaliação sem N setState
   * (ex.: quando o formulário é hidratado em lote via `registerSelected`).
   */
  conditionRefreshKey?: number;
  /**
   * Se fornecido, ativa avaliação em cadeia:
   * além da condição local, verifica se os campos-fonte estão eles
   * próprios visíveis antes de renderizar este campo.
   */
  getFieldCondition?: (id: string) => Condition | undefined;
  /**
   * Override de visibilidade por campo (retorna `false` → nunca renderiza).
   * Só é consultado quando `getFieldCondition` está presente.
   */
  getFieldVisibility?: (id: string) => boolean | undefined;
}

export function useOptimizedConditions({
  fieldId,
  condition,
  formValues,
  relevantFields,
  changedFieldId,
  blurredFieldId,
  conditionRefreshKey = 0,
  getFieldCondition,
  getFieldVisibility,
}: UseOptimizedConditionsProps): boolean {
  const previousResult = useRef<boolean | null>(null);
  const previousRelevantValues = useRef<Record<string, any>>({});
  const previousFormSnapshotRef = useRef<Record<string, any> | null>(null);
  const previousRefreshKey = useRef<number>(conditionRefreshKey);

  return useMemo(() => {
    // Invalidação por refresh key (ex.: reset em lote de registerSelected)
    if (conditionRefreshKey !== previousRefreshKey.current) {
      previousRefreshKey.current = conditionRefreshKey;
      previousResult.current = null;
      previousRelevantValues.current = {};
      previousFormSnapshotRef.current = null;
    }

    const normalized = normalizeConditions(condition);

    // Sem condições → sempre visível
    if (!normalized) return true;

    // ── Detecta se algum campo relevante perdeu foco ─────────────────────────
    const hasRelevantBlurredField =
      !!blurredFieldId &&
      normalized.regras.some((r) => r.campo === blurredFieldId);

    // ── Extrai campos relevantes ──────────────────────────────────────────────
    const conditionRelevantFields =
      relevantFields && relevantFields.length > 0
        ? relevantFields
        : normalized.regras.map((r) => r.campo);

    // ── Detecta mudança nos valores relevantes ────────────────────────────────
    const currentRelevantValues: Record<string, any> = {};
    let hasRelevantValueChanged = false;

    for (const campo of conditionRelevantFields) {
      const cur = formValues[campo];
      currentRelevantValues[campo] = cur;
      if (cur !== previousRelevantValues.current[campo]) {
        hasRelevantValueChanged = true;
      }
    }

    // ── Detecta qualquer mudança no snapshot (para resets via registerSelected) ─
    const prevSnap = previousFormSnapshotRef.current;
    let hasAnyScopedValueChanged = prevSnap == null;

    if (!hasAnyScopedValueChanged) {
      const keys = new Set([
        ...Object.keys(prevSnap!),
        ...Object.keys(formValues),
      ]);
      for (const k of keys) {
        if (prevSnap![k] !== formValues[k]) {
          hasAnyScopedValueChanged = true;
          break;
        }
      }
    }

    // ── Decide se precisa reavaliar ───────────────────────────────────────────
    const shouldReEvaluate =
      previousResult.current === null ||
      hasRelevantBlurredField ||
      hasRelevantValueChanged ||
      hasAnyScopedValueChanged;

    if (!shouldReEvaluate && previousResult.current !== null) {
      return previousResult.current;
    }

    // ── Avalia: modo simples ou modo cadeia ───────────────────────────────────
    const result = getFieldCondition
      ? evaluateEffectiveFieldVisibility(
          fieldId,
          formValues,
          getFieldCondition,
          getFieldVisibility
        )
      : evaluateNormalizedConditions(normalized, formValues, fieldId);

    previousResult.current = result;
    previousRelevantValues.current = currentRelevantValues;
    previousFormSnapshotRef.current = { ...formValues };

    return result;
  }, [
    fieldId,
    condition,
    formValues,
    relevantFields,
    changedFieldId,
    blurredFieldId,
    conditionRefreshKey,
    getFieldCondition,
    getFieldVisibility,
  ]);
}
