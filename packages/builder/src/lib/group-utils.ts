import type { DynamicFieldConfig } from "@jvse/dynamo-core";

export function getGroupById(fields: DynamicFieldConfig[], groupId: string): DynamicFieldConfig | undefined {
  return fields.find((f) => f.id === groupId && f.type === "group");
}

export function addFieldToGroup(
  fields: DynamicFieldConfig[],
  groupId: string,
  field: DynamicFieldConfig
): DynamicFieldConfig[] {
  return fields.map((f) => {
    if (f.id !== groupId || f.type !== "group") return f;
    const children = f.config.children ?? [];
    return { ...f, config: { ...f.config, children: [...children, field] } };
  });
}

export function removeFieldFromGroup(
  fields: DynamicFieldConfig[],
  groupId: string,
  fieldId: string
): { fields: DynamicFieldConfig[]; removed: DynamicFieldConfig | undefined } {
  let removed: DynamicFieldConfig | undefined;
  const next = fields.map((f) => {
    if (f.id !== groupId || f.type !== "group") return f;
    const children = f.config.children ?? [];
    const idx = children.findIndex((c) => c.id === fieldId);
    if (idx < 0) return f;
    removed = children[idx];
    return {
      ...f,
      config: { ...f.config, children: children.filter((c) => c.id !== fieldId) },
    };
  });
  return { fields: next, removed };
}

export function findFieldParent(
  fields: DynamicFieldConfig[],
  fieldId: string
): { group: DynamicFieldConfig; index: number } | null {
  for (const f of fields) {
    if (f.type === "group" && f.config.children) {
      const idx = f.config.children.findIndex((c) => c.id === fieldId);
      if (idx >= 0) return { group: f, index: idx };
    }
  }
  return null;
}

export function getFieldById(fields: DynamicFieldConfig[], fieldId: string): DynamicFieldConfig | undefined {
  for (const f of fields) {
    if (f.id === fieldId) return f;
    if (f.type === "group" && f.config.children) {
      const found = getFieldById(f.config.children, fieldId);
      if (found) return found;
    }
  }
  return undefined;
}

export function getAllRootFieldIds(fields: DynamicFieldConfig[]): string[] {
  return fields.map((f) => f.id);
}

export function getFlattenedFields(fields: DynamicFieldConfig[]): DynamicFieldConfig[] {
  const out: DynamicFieldConfig[] = [];
  for (const f of fields) {
    out.push(f);
    if (f.type === "group" && f.config.children?.length) {
      out.push(...getFlattenedFields(f.config.children));
    }
  }
  return out;
}

export function moveFieldWithinGroup(
  fields: DynamicFieldConfig[],
  groupId: string,
  fieldId: string,
  toIndex: number
): DynamicFieldConfig[] {
  return fields.map((f) => {
    if (f.id !== groupId || f.type !== "group") return f;
    const children = [...(f.config.children ?? [])];
    const fromIdx = children.findIndex((c) => c.id === fieldId);
    if (fromIdx < 0) return f;
    const [item] = children.splice(fromIdx, 1);
    children.splice(Math.min(toIndex, children.length), 0, item);
    return { ...f, config: { ...f.config, children } };
  });
}
