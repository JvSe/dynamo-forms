import type { Condition, ConditionRule } from "./types/condition.js";
import type { DynamicFieldConfig } from "./types/field.js";

// ─── Dev flag (funciona em React Native e em ambientes web/Node) ──────────────
declare const __DEV__: boolean | undefined;
const _isDev: boolean = (() => {
  if (typeof __DEV__ !== "undefined") return !!__DEV__;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).process?.env?.NODE_ENV !== "production";
  } catch {
    return false;
  }
})();

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários gerais
// ─────────────────────────────────────────────────────────────────────────────

export function slugFromLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export type OptionLike = { label: string; value?: string };

export function getOptionValue(opt: OptionLike): string {
  return opt.value != null && opt.value !== "" ? opt.value : slugFromLabel(opt.label);
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Árvore binária de condições
// ─────────────────────────────────────────────────────────────────────────────

type ConditionTreeNode =
  | { type: "RULE"; rule: ConditionRule }
  | { type: "AND"; left: ConditionTreeNode; right: ConditionTreeNode }
  | { type: "OR";  left: ConditionTreeNode; right: ConditionTreeNode };

// ─── Caches globais ───────────────────────────────────────────────────────────

/** 2-level cache: fieldId → Map<valuesHash, resultado> */
const conditionCache = new Map<string, Map<string, boolean>>();
/** fieldId → campos-fonte de que ele depende */
const fieldDependencies = new Map<string, Set<string>>();
/** campo-fonte → campos que dependem dele (índice reverso, O(1) lookup) */
const reverseDependencies = new Map<string, Set<string>>();
/** Árvores binárias cacheadas por chave de definição da condição */
const conditionTreeCache = new Map<string, ConditionTreeNode>();
/** Campos relevantes de cada condição, cacheados */
const conditionFieldsCache = new Map<string, string[]>();
/** Dependentes transitivos cacheados por campo-fonte */
const transitiveDependentsCache = new Map<string, string[]>();
/** Evita logar o mesmo ciclo mais de uma vez */
const warnedCycleEdges = new Set<string>();
/** Evita re-registrar dependências sem mudança real */
const dependencyRegistrationCache = new Map<string, string>();

// ─── Serialização ─────────────────────────────────────────────────────────────

function serializeConditionValue(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function createCacheKey(relevantValues: Record<string, any>): string {
  return Object.keys(relevantValues)
    .sort()
    .map((k) => `${k}:${serializeConditionValue(relevantValues[k])}`)
    .join("|");
}

function createConditionDefinitionKey(condition: Condition): string {
  return [
    condition.action,
    condition.tipo,
    condition.regras
      .map((r) => [r.campo, r.operador, serializeConditionValue(r.valor)].join(":"))
      .join("|"),
  ].join("::");
}

// ─── Construção da árvore binária ─────────────────────────────────────────────

function createLeafNodes(rules: ConditionRule[]): ConditionTreeNode[] {
  return rules.map((rule) => ({ type: "RULE", rule }));
}

function buildBinaryTree(
  nodes: ConditionTreeNode[],
  operator: "AND" | "OR"
): ConditionTreeNode {
  if (nodes.length === 1) return nodes[0];
  const nextLevel: ConditionTreeNode[] = [];
  for (let i = 0; i < nodes.length; i += 2) {
    const left = nodes[i];
    const right = nodes[i + 1];
    if (!right) { nextLevel.push(left); continue; }
    nextLevel.push({ type: operator, left, right });
  }
  return buildBinaryTree(nextLevel, operator);
}

function getOrBuildConditionTree(condition: Condition): ConditionTreeNode {
  const key = createConditionDefinitionKey(condition);
  const cached = conditionTreeCache.get(key);
  if (cached) return cached;
  const tree = buildBinaryTree(createLeafNodes(condition.regras), condition.tipo);
  conditionTreeCache.set(key, tree);
  return tree;
}

// ─── Coleta de campos relevantes de uma árvore ───────────────────────────────

function collectFieldsFromTree(node: ConditionTreeNode, out: Set<string>): void {
  if (node.type === "RULE") { out.add(node.rule.campo); return; }
  collectFieldsFromTree(node.left, out);
  collectFieldsFromTree(node.right, out);
}

function getConditionRelevantFields(condition: Condition): string[] {
  const key = createConditionDefinitionKey(condition);
  const cached = conditionFieldsCache.get(key);
  if (cached) return cached;
  const tree = getOrBuildConditionTree(condition);
  const set = new Set<string>();
  collectFieldsFromTree(tree, set);
  const list = Array.from(set);
  conditionFieldsCache.set(key, list);
  return list;
}

// ─── Avaliação da árvore (com short-circuit nativo) ─────────────────────────

function valueIsEmpty(v: unknown): boolean {
  if (v === "" || v === null || v === undefined) return true;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function evaluateRule(
  targetValue: unknown,
  operador: ConditionRule["operador"],
  expectedValue: unknown
): boolean {
  switch (operador) {
    case "equals":
      if (Array.isArray(targetValue)) {
        if (Array.isArray(expectedValue)) {
          if (targetValue.length !== expectedValue.length) return false;
          return targetValue.every((v, i) => String(v) === String(expectedValue[i]));
        }
        return targetValue.some((v) => String(v) === String(expectedValue));
      }
      return targetValue === expectedValue;
    case "notEquals":
      if (Array.isArray(targetValue)) {
        if (Array.isArray(expectedValue)) {
          if (targetValue.length !== expectedValue.length) return true;
          return !targetValue.every((v, i) => String(v) === String(expectedValue[i]));
        }
        return !targetValue.some((v) => String(v) === String(expectedValue));
      }
      return targetValue !== expectedValue;
    case "contains":
      if (Array.isArray(targetValue)) {
        if (expectedValue === undefined || expectedValue === null) return false;
        const exp = String(expectedValue);
        return targetValue.some((v) => String(v) === exp);
      }
      return (
        typeof targetValue === "string" &&
        typeof expectedValue === "string" &&
        targetValue.includes(expectedValue)
      );
    case "notContains":
      if (Array.isArray(targetValue)) {
        if (expectedValue === undefined || expectedValue === null) return true;
        const exp = String(expectedValue);
        return !targetValue.some((v) => String(v) === exp);
      }
      return (
        typeof targetValue === "string" &&
        typeof expectedValue === "string" &&
        !targetValue.includes(expectedValue)
      );
    case "isEmpty":
      return valueIsEmpty(targetValue);
    case "isNotEmpty":
      return !valueIsEmpty(targetValue);
    default:
      return true;
  }
}

function evaluateConditionTree(
  node: ConditionTreeNode,
  formValues: Record<string, any>
): boolean {
  if (node.type === "RULE") {
    return evaluateRule(formValues[node.rule.campo], node.rule.operador, node.rule.valor);
  }
  if (node.type === "AND") {
    // short-circuit: para no primeiro false
    return (
      evaluateConditionTree(node.left, formValues) &&
      evaluateConditionTree(node.right, formValues)
    );
  }
  // OR — short-circuit: para no primeiro true
  return (
    evaluateConditionTree(node.left, formValues) ||
    evaluateConditionTree(node.right, formValues)
  );
}

// ─── Cache de condições (2 níveis) ───────────────────────────────────────────

export function getCachedConditionResult(
  fieldId: string,
  condition: Condition,
  formValues: Record<string, any>
): boolean | null {
  if (!condition?.regras) return null;
  if (!conditionCache.has(fieldId)) return null;
  const relevantValues = getConditionRelevantFields(condition).reduce((acc, f) => {
    acc[f] = formValues[f];
    return acc;
  }, {} as Record<string, any>);
  return conditionCache.get(fieldId)!.get(createCacheKey(relevantValues)) ?? null;
}

function setCachedConditionResult(
  fieldId: string,
  relevantValues: Record<string, any>,
  result: boolean
) {
  if (!conditionCache.has(fieldId)) conditionCache.set(fieldId, new Map());
  conditionCache.get(fieldId)!.set(createCacheKey(relevantValues), result);
}

// ─── Grafo de dependências ────────────────────────────────────────────────────

function invalidateDependencyCaches() {
  transitiveDependentsCache.clear();
}

/** Ordena nós em ordem topológica (Kahn). Ciclos residuais são appendados no final. */
function sortDependentsTopologically(nodes: Set<string>): string[] {
  if (nodes.size === 0) return [];

  const indegree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  for (const node of nodes) {
    indegree.set(node, 0);
    adjacency.set(node, new Set());
  }
  for (const source of nodes) {
    const deps = reverseDependencies.get(source);
    if (!deps) continue;
    for (const dep of deps) {
      if (!nodes.has(dep)) continue;
      adjacency.get(source)!.add(dep);
      indegree.set(dep, (indegree.get(dep) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [node, degree] of indegree) {
    if (degree === 0) queue.push(node);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const next of adjacency.get(current) ?? []) {
      const deg = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  // Ciclo residual: appenda em ordem estável
  if (sorted.length < nodes.size) {
    for (const node of nodes) {
      if (!sorted.includes(node)) sorted.push(node);
    }
  }

  return sorted;
}

/** Detecção de ciclos via DFS com inStack. Apenas loga em dev. */
function detectAndWarnCyclesForField(fieldId: string) {
  const visited = new Set<string>();
  const inStack = new Set<string>();

  const dfs = (node: string): boolean => {
    if (inStack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    inStack.add(node);
    for (const dep of fieldDependencies.get(node) ?? []) {
      if (dfs(dep)) return true;
    }
    inStack.delete(node);
    return false;
  };

  if (dfs(fieldId)) {
    const key = `cycle:${fieldId}`;
    if (!warnedCycleEdges.has(key)) {
      warnedCycleEdges.add(key);
      console.warn(
        `[dynamo-forms] Ciclo detectado nas dependências condicionais a partir de '${fieldId}'.`
      );
    }
  }
}

/**
 * Retorna todos os campos que transitivamente dependem de `fieldId` (BFS no
 * grafo reverso), ordenados topologicamente.
 */
export function getDependentFieldIds(fieldId: string): string[] {
  const cached = transitiveDependentsCache.get(fieldId);
  if (cached) return cached;

  const visited = new Set<string>();
  const queue: string[] = [...(reverseDependencies.get(fieldId) ?? [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const dep of reverseDependencies.get(current) ?? []) {
      if (!visited.has(dep)) queue.push(dep);
    }
  }

  const ordered = sortDependentsTopologically(visited);
  transitiveDependentsCache.set(fieldId, ordered);
  return ordered;
}

/**
 * Invalida o cache de condição apenas dos campos transitivamente afetados
 * pela mudança de `changedFieldId` — O(k) onde k = campos afetados.
 */
export function clearConditionCacheForField(changedFieldId: string) {
  const affected = getDependentFieldIds(changedFieldId);
  for (const fieldId of affected) {
    conditionCache.get(fieldId)?.clear();
  }
}

/** Limpa todo o estado do grafo (útil em testes ou ao desmontar o formulário). */
export function clearConditionGraphState() {
  conditionCache.clear();
  fieldDependencies.clear();
  reverseDependencies.clear();
  conditionTreeCache.clear();
  conditionFieldsCache.clear();
  transitiveDependentsCache.clear();
  warnedCycleEdges.clear();
  dependencyRegistrationCache.clear();
}

// ─── Registro de dependências ─────────────────────────────────────────────────

export function normalizeConditions(
  conditions?: Condition
): Condition | undefined {
  if (!conditions) return undefined;
  if (!conditions.regras || conditions.regras.length === 0) return undefined;
  return conditions;
}

/**
 * Registra as dependências de um campo no grafo (direto + reverso).
 * Idempotente: ignora chamadas repetidas com a mesma definição de condição.
 */
export function registerFieldDependency(
  fieldId: string,
  condition: Condition | undefined
) {
  const normalized = normalizeConditions(condition);
  const regKey = normalized
    ? createConditionDefinitionKey(normalized)
    : "__no_condition__";

  if (dependencyRegistrationCache.get(fieldId) === regKey) return;
  dependencyRegistrationCache.set(fieldId, regKey);

  // Remove dependências anteriores (evita "fantasmas")
  const prev = fieldDependencies.get(fieldId);
  if (prev) {
    for (const dep of prev) {
      const rev = reverseDependencies.get(dep);
      if (!rev) continue;
      rev.delete(fieldId);
      if (rev.size === 0) reverseDependencies.delete(dep);
    }
    fieldDependencies.delete(fieldId);
  }

  if (!normalized?.regras) {
    invalidateDependencyCaches();
    return;
  }

  const deps = new Set<string>();
  for (const sourceId of getConditionRelevantFields(normalized)) {
    deps.add(sourceId);
    if (!reverseDependencies.has(sourceId)) {
      reverseDependencies.set(sourceId, new Set());
    }
    reverseDependencies.get(sourceId)!.add(fieldId);
  }

  fieldDependencies.set(fieldId, deps);
  if (_isDev) detectAndWarnCyclesForField(fieldId);
  invalidateDependencyCaches();
}

/** Percorre a lista de campos (e grupos aninhados) registrando todas as dependências. */
export function registerConditionDependenciesFromFields(
  fields: Array<{ id: string; type: string; config: { conditions?: Condition; children?: any[] } }>
) {
  const walk = (list: typeof fields) => {
    for (const f of list) {
      registerFieldDependency(f.id, f.config.conditions);
      if (f.type === "group" && f.config.children) walk(f.config.children);
    }
  };
  walk(fields);
}

// ─── Avaliação de condições (API pública) ─────────────────────────────────────

export function evaluateNormalizedConditions(
  normalized: Condition | undefined,
  formValues: Record<string, any>,
  fieldId?: string
): boolean {
  if (!normalized) return true;

  const tree = getOrBuildConditionTree(normalized);
  const relevantValues = getConditionRelevantFields(normalized).reduce((acc, f) => {
    acc[f] = formValues[f];
    return acc;
  }, {} as Record<string, any>);

  if (fieldId) {
    const cached = conditionCache.get(fieldId)?.get(createCacheKey(relevantValues));
    if (cached !== undefined) return cached;
  }

  const raw = evaluateConditionTree(tree, formValues);
  const result = normalized.action === "show" ? raw : !raw;

  if (fieldId) setCachedConditionResult(fieldId, relevantValues, result);
  return result;
}

export function evaluateConditions(
  condition: Condition | undefined,
  formValues: Record<string, any>,
  fieldId?: string
): boolean {
  return evaluateNormalizedConditions(
    normalizeConditions(condition),
    formValues,
    fieldId
  );
}

// ─── Avaliação em cadeia (visibilidade transitiva) ────────────────────────────

/**
 * Avalia a visibilidade efetiva de um campo considerando:
 * 1. Sua própria condição local
 * 2. A visibilidade dos campos-fonte referenciados nas regras (recursivo)
 *
 * Exemplo: campo A aparece quando B = "sim". Se B está oculto por outra condição,
 * A também deve ficar oculto — mesmo que B tenha o valor "sim" no formulário.
 */
export function evaluateEffectiveFieldVisibility(
  fieldId: string,
  formValues: Record<string, any>,
  getFieldCondition: (id: string) => Condition | undefined,
  getFieldVisibility?: (id: string) => boolean | undefined,
  memo: Map<string, boolean> = new Map(),
  visiting: Set<string> = new Set()
): boolean {
  const cached = memo.get(fieldId);
  if (cached !== undefined) return cached;
  if (visiting.has(fieldId)) return false; // ciclo → oculta por segurança

  if (getFieldVisibility?.(fieldId) === false) {
    memo.set(fieldId, false);
    return false;
  }

  const normalized = normalizeConditions(getFieldCondition(fieldId));
  if (!normalized) {
    memo.set(fieldId, true);
    return true;
  }

  visiting.add(fieldId);
  const local = evaluateNormalizedConditions(normalized, formValues, fieldId);

  if (!local) {
    visiting.delete(fieldId);
    memo.set(fieldId, false);
    return false;
  }

  // Verifica se os campos-fonte da condição estão eles próprios visíveis
  for (const depId of getConditionRelevantFields(normalized)) {
    if (depId === fieldId) continue;
    if (
      !evaluateEffectiveFieldVisibility(
        depId,
        formValues,
        getFieldCondition,
        getFieldVisibility,
        memo,
        visiting
      )
    ) {
      visiting.delete(fieldId);
      memo.set(fieldId, false);
      return false;
    }
  }

  visiting.delete(fieldId);
  memo.set(fieldId, true);
  return true;
}

// ─── Helpers para mapas de condição/visibilidade ──────────────────────────────

export type FieldNodeWithConditions = {
  id: string;
  type: string;
  config: {
    conditions?: Condition;
    visibility?: boolean;
    children?: FieldNodeWithConditions[];
  };
};

/** Constrói um mapa `id → { conditions, visibility }` percorrendo a árvore de campos. */
export function buildFieldIdToConditionMap(
  fields: FieldNodeWithConditions[]
): Map<string, { conditions?: Condition; visibility?: boolean }> {
  const map = new Map<string, { conditions?: Condition; visibility?: boolean }>();
  const walk = (list: FieldNodeWithConditions[]) => {
    for (const f of list) {
      map.set(f.id, { conditions: f.config.conditions, visibility: f.config.visibility });
      if (f.type === "group" && f.config.children?.length) walk(f.config.children);
    }
  };
  walk(fields);
  return map;
}

export function getFieldConditionFromMap(
  map: ReadonlyMap<string, { conditions?: Condition; visibility?: boolean }>,
  id: string
): Condition | undefined {
  return map.get(id)?.conditions;
}

export function getFieldVisibilityFromMap(
  map: ReadonlyMap<string, { conditions?: Condition; visibility?: boolean }>,
  id: string
): boolean | undefined {
  return map.get(id)?.visibility;
}

// ─── Índice estrutural do formulário (re-exportado de conditional-graph) ──────
// Importado aqui para que consumers que importem apenas utils.ts tenham acesso.
export type { ConditionalGraphIndex } from "./conditional-graph.js";
export {
  buildConditionalGraphIndex,
  getConditionalValidationClosure,
  groupSubtreeTouchesScope,
} from "./conditional-graph.js";
