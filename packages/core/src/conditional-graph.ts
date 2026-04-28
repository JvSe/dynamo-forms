import type { DynamicFieldConfig } from "./types/field.js";

// ─────────────────────────────────────────────────────────────────────────────
// Índice estrutural do formulário
//
// Complementa o grafo de dependências em utils.ts com informações sobre a
// hierarquia física do formulário (grupos aninhados, folhas validáveis).
// Útil para determinar quais validações precisam ser reexecutadas após uma
// mudança e se um grupo inteiro está dentro do escopo afetado.
// ─────────────────────────────────────────────────────────────────────────────

export type ConditionalGraphIndex = {
  /** campo-fonte → IDs dos campos cujas regras de condição referenciam esse campo */
  sourceToConditionalFields: Map<string, Set<string>>;
  /** grupo id → IDs de todas as folhas validáveis sob aquele grupo (recursivo) */
  groupToDescendantLeafIds: Map<string, Set<string>>;
  /** todos os IDs validáveis (não são título, divisor nem grupo) */
  allValidatableLeafIds: Set<string>;
};

const isValidatableLeaf = (f: DynamicFieldConfig): boolean =>
  f.type !== "title" && f.type !== "divider" && f.type !== "group";

/** Percorre todos os campos, inclusive filhos de grupos, chamando `visit` para cada um. */
const walkFields = (
  list: DynamicFieldConfig[],
  visit: (f: DynamicFieldConfig, parentGroupId: string | null) => void,
  parentGroupId: string | null = null
): void => {
  for (const f of list) {
    visit(f, parentGroupId);
    if (f.type === "group" && f.config.children) {
      walkFields(f.config.children, visit, f.id);
    }
  }
};

/** Mapa campo-fonte → campos que têm regras de condição referenciando esse campo. */
const buildSourceToConditionalFields = (
  fields: DynamicFieldConfig[]
): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();

  walkFields(fields, (f) => {
    const rules = f.config.conditions?.regras;
    if (!rules?.length) return;
    for (const rule of rules) {
      if (!map.has(rule.campo)) map.set(rule.campo, new Set());
      map.get(rule.campo)!.add(f.id);
    }
  });

  return map;
};

/** Coleta recursivamente as folhas validáveis de uma lista de filhos. */
const collectLeaves = (children: DynamicFieldConfig[]): Set<string> => {
  const out = new Set<string>();
  for (const c of children) {
    if (c.type === "group" && c.config.children) {
      collectLeaves(c.config.children).forEach((id) => out.add(id));
    } else if (isValidatableLeaf(c)) {
      out.add(c.id);
    }
  }
  return out;
};

/** Mapa grupo-id → todas as folhas validáveis descendentes. */
const buildGroupToDescendantLeaves = (
  fields: DynamicFieldConfig[]
): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();

  walkFields(fields, (f) => {
    if (f.type === "group" && f.config.children) {
      const leaves = collectLeaves(f.config.children);
      if (leaves.size > 0) map.set(f.id, leaves);
    }
  });

  return map;
};

const buildAllValidatableLeafIds = (
  fields: DynamicFieldConfig[]
): Set<string> => {
  const set = new Set<string>();
  walkFields(fields, (f) => { if (isValidatableLeaf(f)) set.add(f.id); });
  return set;
};

/**
 * Constrói o índice estrutural a partir da lista de campos do formulário.
 * Deve ser chamado uma vez por formulário (quando os campos mudam).
 */
export const buildConditionalGraphIndex = (
  fields: DynamicFieldConfig[]
): ConditionalGraphIndex => ({
  sourceToConditionalFields: buildSourceToConditionalFields(fields),
  groupToDescendantLeafIds: buildGroupToDescendantLeaves(fields),
  allValidatableLeafIds: buildAllValidatableLeafIds(fields),
});

/**
 * Retorna o fecho transitivo de campos afetados pela mudança de `triggerFieldId`.
 * Inclui o próprio campo disparador + todos que dependem condicionalmente dele
 * (em cadeia) segundo o índice estrutural.
 *
 * Útil para determinar quais schemas Zod precisam ser recalculados.
 */
export const getConditionalValidationClosure = (
  graph: ConditionalGraphIndex,
  triggerFieldId: string
): Set<string> => {
  const closure = new Set<string>();
  const queue: string[] = [];

  const visit = (id: string) => {
    if (closure.has(id)) return;
    closure.add(id);
    queue.push(id);
  };

  visit(triggerFieldId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.sourceToConditionalFields.get(current);
    if (!dependents) continue;
    for (const fid of dependents) {
      if (!closure.has(fid)) {
        closure.add(fid);
        queue.push(fid);
      }
    }
  }

  return closure;
};

/**
 * Verifica se alguma folha validável descendente de `groupId` pertence ao
 * conjunto `scope`. Permite decidir eficientemente se re-renderizar um grupo.
 */
export const groupSubtreeTouchesScope = (
  graph: ConditionalGraphIndex,
  groupId: string,
  scope: Set<string>
): boolean => {
  const leaves = graph.groupToDescendantLeafIds.get(groupId);
  if (!leaves) return false;
  for (const id of leaves) {
    if (scope.has(id)) return true;
  }
  return false;
};
