export type FieldLayout = Record<string, { row: number; col: number }>;

export function getEmptyLayout(): FieldLayout {
  return {};
}

export function getLayoutForNewField(
  layout: FieldLayout,
  fieldIds: string[],
  position:
    | "append"
    | { rightOf: string }
    | { leftOf: string }
    | { below: string }
): { row: number; col: number; nextLayout: FieldLayout } {
  const nextLayout = { ...layout };

  if (position === "append") {
    let maxRow = -1;
    for (const id of fieldIds) {
      const pos = layout[id] ?? { row: 0, col: 0 };
      if (pos.row > maxRow) maxRow = pos.row;
    }
    return { row: maxRow + 1, col: 0, nextLayout };
  }

  if ("rightOf" in position) {
    const target = layout[position.rightOf] ?? { row: 0, col: 0 };
    const newRow = target.row;
    const newCol = target.col + 1;
    for (const id of fieldIds) {
      const pos = nextLayout[id] ?? { row: 0, col: 0 };
      if (pos.row === newRow && pos.col >= newCol) {
        nextLayout[id] = { ...pos, col: pos.col + 1 };
      }
    }
    return { row: newRow, col: newCol, nextLayout };
  }

  if ("leftOf" in position) {
    const target = layout[position.leftOf] ?? { row: 0, col: 0 };
    const newRow = target.row;
    const newCol = target.col;
    for (const id of fieldIds) {
      const pos = nextLayout[id] ?? { row: 0, col: 0 };
      if (pos.row === newRow && pos.col >= newCol) {
        nextLayout[id] = { ...pos, col: pos.col + 1 };
      }
    }
    return { row: newRow, col: newCol, nextLayout };
  }

  if ("below" in position) {
    const target = layout[position.below] ?? { row: 0, col: 0 };
    const newRow = target.row + 1;
    const newCol = target.col;
    for (const id of fieldIds) {
      const pos = nextLayout[id] ?? { row: 0, col: 0 };
      if (pos.row >= newRow) {
        nextLayout[id] = { ...pos, row: pos.row + 1 };
      }
    }
    return { row: newRow, col: newCol, nextLayout };
  }

  return { row: 0, col: 0, nextLayout };
}

export function moveFieldLayout(
  layout: FieldLayout,
  fieldIds: string[],
  fieldId: string,
  position: { rightOf: string } | { leftOf: string } | { below: string }
): FieldLayout {
  const { row, col, nextLayout } = getLayoutForNewField(layout, fieldIds, position);
  nextLayout[fieldId] = { row, col };
  return nextLayout;
}

export function removeFromLayout(layout: FieldLayout, fieldId: string): FieldLayout {
  const pos = layout[fieldId];
  if (!pos) return { ...layout };
  const next = { ...layout };
  delete next[fieldId];
  for (const id of Object.keys(next)) {
    const p = next[id];
    if (p.row === pos.row && p.col > pos.col) next[id] = { ...p, col: p.col - 1 };
    if (p.row > pos.row) next[id] = { ...p, row: p.row - 1 };
  }
  return next;
}

export function ensureLayoutForFields(layout: FieldLayout, fieldIds: string[]): FieldLayout {
  const next = { ...layout };
  let maxRow = -1;
  for (const id of fieldIds) {
    if (next[id] != null) {
      if (next[id].row > maxRow) maxRow = next[id].row;
    }
  }
  for (const id of fieldIds) {
    if (next[id] == null) {
      maxRow += 1;
      next[id] = { row: maxRow, col: 0 };
    }
  }
  return next;
}
