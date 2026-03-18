export const FORM_CANVAS_ID = "form-canvas";
export const CANVAS_TOP_DROP_ID = "drop-canvas-top";

export function dropRightId(fieldId: string): string {
  return `drop-right-${fieldId}`;
}

export function dropLeftId(fieldId: string): string {
  return `drop-left-${fieldId}`;
}

export function dropBottomId(fieldId: string): string {
  return `drop-bottom-${fieldId}`;
}

export function groupChildrenId(groupId: string): string {
  return `group-${groupId}-children`;
}

/** Drop zone to move a field from inside a group to root (outside the group). */
export function dropUngroupId(groupId: string): string {
  return `drop-ungroup-${groupId}`;
}

export function parseDropId(overId: string): {
  type: "canvas" | "top" | "bottom" | "group" | "ungroup";
  fieldId?: string;
  groupId?: string;
} | null {
  if (overId === FORM_CANVAS_ID) return { type: "canvas" };
  if (overId === CANVAS_TOP_DROP_ID) return { type: "top" };
  if (overId.startsWith("drop-bottom-")) return { type: "bottom", fieldId: overId.slice("drop-bottom-".length) };
  if (overId.startsWith("drop-ungroup-")) return { type: "ungroup", groupId: overId.slice("drop-ungroup-".length) };
  if (overId.startsWith("group-") && overId.endsWith("-children")) {
    const groupId = overId.slice("group-".length, -"-children".length);
    return { type: "group", groupId };
  }
  return null;
}
