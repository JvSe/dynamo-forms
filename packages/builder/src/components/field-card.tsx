import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Pencil, Trash2, Zap } from "lucide-react";
import type { DynamicFieldConfig } from "@jvseen/dynamo-core";
import { FIELD_TYPES } from "../constants/field-types.js";
import { cn } from "../lib/utils.js";

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  FIELD_TYPES.map((t) => [t.type, t.label])
);

function DragDotsIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
      <circle cx="4" cy="4" r="1.5" />
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="4" cy="16" r="1.5" />
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  );
}

export type FieldCardMode = "sortable" | "draggable";

type FieldCardProps = {
  field: DynamicFieldConfig;
  isSelected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  children?: React.ReactNode;
  mode?: FieldCardMode;
};

function FieldActions({
  onSelect,
  onRemove,
  onDuplicate,
}: {
  onSelect: () => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 z-10">
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDuplicate && (
          <button
            type="button"
            title="Duplicate"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400/50 hover:text-gray-700 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          title="Edit"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400/50 hover:text-gray-700 transition-colors"
        >
          <Pencil className="w-3 h-3" />
        </button>
        {onRemove && (
          <button
            type="button"
            title="Remove"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400/50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function FieldCard({
  field,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  children,
  mode = "sortable",
}: FieldCardProps) {
  const sortable = useSortable({ id: field.id });
  const draggable = useDraggable({
    id: field.id,
    data: { source: "canvas" as const, fieldId: field.id },
  });

  const isDraggableMode = mode === "draggable";
  const attributes = isDraggableMode ? draggable.attributes : sortable.attributes;
  const listeners = isDraggableMode ? draggable.listeners : sortable.listeners;
  const setNodeRef = isDraggableMode ? draggable.setNodeRef : sortable.setNodeRef;
  const transform = isDraggableMode ? null : sortable.transform;
  const transition = isDraggableMode ? undefined : sortable.transition;
  const isDragging = isDraggableMode ? draggable.isDragging : sortable.isDragging;

  const cardRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    cardRef.current = el;
  };

  const sectionTitle =
    field.type === "title"
      ? (field.config.titleText ?? field.config.label)
      : field.config.label || field.config.name || field.id;

  const baseCardClass = cn(
    "mb-1 rounded-xl border border-gray-200 bg-white overflow-hidden",
    isDragging ? "opacity-0" : "opacity-100"
  );

  const baseCardStyle: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition ?? "box-shadow 0.2s ease, transform 0.2s ease",
    boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.05)",
  };

  if (children) {
    if (field.type === "group") {
      return (
        <div
          ref={combinedRef}
          className={cn(baseCardClass, "group")}
          style={baseCardStyle}
          {...attributes}
        >
          <div className="flex items-center gap-0 border-b border-gray-100 bg-gray-50">
            <div
              {...listeners}
              className="flex items-center justify-center px-2 py-3 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 self-stretch"
              onClick={(e) => e.stopPropagation()}
            >
              <DragDotsIcon />
            </div>
            <div
              className="flex flex-1 items-center gap-1.5 py-3 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <span className="text-[15px] font-medium text-gray-900">
                {sectionTitle}
              </span>
              {!!field.config.conditions && (
                <span title="Has conditional logic" className="flex items-center text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 pr-2">
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {onDuplicate && (
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400/50 hover:text-gray-700 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  title="Edit"
                  onClick={(e) => { e.stopPropagation(); onSelect(); }}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400/50 hover:text-gray-700 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                {onRemove && (
                  <button
                    type="button"
                    title="Remove"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400/50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={combinedRef}
        className={cn(baseCardClass, "flex group")}
        style={baseCardStyle}
        {...attributes}
      >
        <div
          {...listeners}
          className="flex items-center justify-center px-1.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 self-stretch"
          onClick={(e) => e.stopPropagation()}
        >
          <DragDotsIcon />
        </div>

        <div
          className="relative flex-1 min-w-0 cursor-pointer py-2.5 pr-2.5"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-medium text-gray-900">{sectionTitle}</span>
            {!!field.config.conditions && (
              <span title="Has conditional logic" className="flex items-center text-amber-400">
                <Zap className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <FieldActions
            onSelect={onSelect}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
          />
          {children}
        </div>
      </div>
    );
  }

  const typeLabel = FIELD_LABELS[field.type] ?? field.type;
  return (
    <div
      ref={combinedRef}
      className={cn(baseCardClass, "flex group")}
      style={baseCardStyle}
      {...attributes}
    >
      <div
        {...listeners}
        className="flex items-center justify-center px-1.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 self-stretch"
        onClick={(e) => e.stopPropagation()}
      >
        <DragDotsIcon />
      </div>

      <div
        className="relative flex-1 min-w-0 cursor-pointer py-2.5 pr-2.5"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-medium text-gray-900">{sectionTitle}</span>
          {!!field.config.conditions && (
            <span title="Has conditional logic" className="flex items-center text-amber-400">
              <Zap className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <FieldActions
          onSelect={onSelect}
          onRemove={onRemove}
          onDuplicate={onDuplicate}
        />
        <div className="text-xs text-gray-500 mt-0.5">{typeLabel}</div>
      </div>
    </div>
  );
}
