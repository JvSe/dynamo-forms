import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpToLine, Copy, Pencil, Trash2, Zap } from "lucide-react";
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
  onMoveOutOfGroup?: () => void;
  children?: React.ReactNode;
  mode?: FieldCardMode;
};

function FieldActions({
  onSelect,
  onRemove,
  onDuplicate,
  onMoveOutOfGroup,
}: {
  onSelect: () => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onMoveOutOfGroup?: () => void;
}) {
  return (
    <div className="dyn:absolute dyn:top-1.5 dyn:right-1.5 dyn:flex dyn:items-center dyn:gap-0.5 dyn:z-10">
      <div className="dyn:flex dyn:items-center dyn:gap-0.5 dyn:opacity-0 dyn:group-hover:opacity-100 dyn:transition-opacity">
        {onMoveOutOfGroup && (
          <button
            type="button"
            title="Mover para fora do grupo"
            onClick={(e) => { e.stopPropagation(); onMoveOutOfGroup(); }}
            className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-blue-50 dyn:text-gray-400/50 dyn:hover:text-blue-600 dyn:transition-colors"
          >
            <ArrowUpToLine className="dyn:w-3 dyn:h-3" />
          </button>
        )}
        {onDuplicate && (
          <button
            type="button"
            title="Duplicate"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-gray-100 dyn:text-gray-400/50 dyn:hover:text-gray-700 dyn:transition-colors"
          >
            <Copy className="dyn:w-3 dyn:h-3" />
          </button>
        )}
        <button
          type="button"
          title="Edit"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-gray-100 dyn:text-gray-400/50 dyn:hover:text-gray-700 dyn:transition-colors"
        >
          <Pencil className="dyn:w-3 dyn:h-3" />
        </button>
        {onRemove && (
          <button
            type="button"
            title="Remove"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-red-50 dyn:text-gray-400/50 dyn:hover:text-red-500 dyn:transition-colors"
          >
            <Trash2 className="dyn:w-3 dyn:h-3" />
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
  onMoveOutOfGroup,
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
    "dyn:mb-1 dyn:rounded-xl dyn:border dyn:border-gray-200 dyn:bg-white dyn:overflow-hidden",
    isDragging ? "dyn:opacity-0" : "dyn:opacity-100"
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
          className={cn(baseCardClass, "dyn:group")}
          style={baseCardStyle}
          {...attributes}
        >
          <div className="dyn:flex dyn:items-center dyn:gap-0 dyn:border-b dyn:border-gray-100 dyn:bg-gray-50">
            <div
              {...listeners}
              className="dyn:flex dyn:items-center dyn:justify-center dyn:px-2 dyn:py-3 dyn:text-gray-300 dyn:hover:text-gray-500 dyn:cursor-grab dyn:active:cursor-grabbing dyn:shrink-0 dyn:self-stretch"
              onClick={(e) => e.stopPropagation()}
            >
              <DragDotsIcon />
            </div>
            <div
              className="dyn:flex dyn:flex-1 dyn:items-center dyn:gap-1.5 dyn:py-3 dyn:cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <span className="dyn:text-[15px] dyn:font-medium dyn:text-gray-900">
                {sectionTitle}
              </span>
              {!!field.config.conditions && (
                <span title="Has conditional logic" className="dyn:flex dyn:items-center dyn:text-amber-400">
                  <Zap className="dyn:w-3.5 dyn:h-3.5" />
                </span>
              )}
            </div>
            <div className="dyn:flex dyn:items-center dyn:gap-0.5 dyn:pr-2">
              <div className="dyn:flex dyn:items-center dyn:gap-0.5 dyn:opacity-0 dyn:group-hover:opacity-100 dyn:transition-opacity">
                {onDuplicate && (
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-gray-100 dyn:text-gray-400/50 dyn:hover:text-gray-700 dyn:transition-colors"
                  >
                    <Copy className="dyn:w-3 dyn:h-3" />
                  </button>
                )}
                <button
                  type="button"
                  title="Edit"
                  onClick={(e) => { e.stopPropagation(); onSelect(); }}
                  className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-gray-100 dyn:text-gray-400/50 dyn:hover:text-gray-700 dyn:transition-colors"
                >
                  <Pencil className="dyn:w-3 dyn:h-3" />
                </button>
                {onRemove && (
                  <button
                    type="button"
                    title="Remove"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="dyn:p-1.5 dyn:rounded-md dyn:hover:bg-red-50 dyn:text-gray-400/50 dyn:hover:text-red-500 dyn:transition-colors"
                  >
                    <Trash2 className="dyn:w-3 dyn:h-3" />
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
        className={cn(baseCardClass, "dyn:flex dyn:group")}
        style={baseCardStyle}
        {...attributes}
      >
        <div
          {...listeners}
          className="dyn:flex dyn:items-center dyn:justify-center dyn:px-1.5 dyn:text-gray-300 dyn:hover:text-gray-500 dyn:cursor-grab dyn:active:cursor-grabbing dyn:shrink-0 dyn:self-stretch"
          onClick={(e) => e.stopPropagation()}
        >
          <DragDotsIcon />
        </div>

        <div
          className="dyn:relative dyn:flex-1 dyn:min-w-0 dyn:cursor-pointer dyn:py-2.5 dyn:pr-2.5"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <div className="dyn:flex dyn:items-center dyn:gap-1.5 dyn:mb-1">
            <span className="dyn:text-sm dyn:font-medium dyn:text-gray-900">{sectionTitle}</span>
            {!!field.config.conditions && (
              <span title="Has conditional logic" className="dyn:flex dyn:items-center dyn:text-amber-400">
                <Zap className="dyn:w-3.5 dyn:h-3.5" />
              </span>
            )}
          </div>
          <FieldActions
            onSelect={onSelect}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
            onMoveOutOfGroup={onMoveOutOfGroup}
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
      className={cn(baseCardClass, "dyn:flex dyn:group")}
      style={baseCardStyle}
      {...attributes}
    >
      <div
        {...listeners}
        className="dyn:flex dyn:items-center dyn:justify-center dyn:px-1.5 dyn:text-gray-300 dyn:hover:text-gray-500 dyn:cursor-grab dyn:active:cursor-grabbing dyn:shrink-0 dyn:self-stretch"
        onClick={(e) => e.stopPropagation()}
      >
        <DragDotsIcon />
      </div>

      <div
        className="dyn:relative dyn:flex-1 dyn:min-w-0 dyn:cursor-pointer dyn:py-2.5 dyn:pr-2.5"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <div className="dyn:flex dyn:items-center dyn:gap-1.5 dyn:mb-1">
          <span className="dyn:text-sm dyn:font-medium dyn:text-gray-900">{sectionTitle}</span>
          {!!field.config.conditions && (
            <span title="Has conditional logic" className="dyn:flex dyn:items-center dyn:text-amber-400">
              <Zap className="dyn:w-3.5 dyn:h-3.5" />
            </span>
          )}
        </div>
        <FieldActions
          onSelect={onSelect}
          onRemove={onRemove}
          onDuplicate={onDuplicate}
        />
        <div className="dyn:text-xs dyn:text-gray-500 dyn:mt-0.5">{typeLabel}</div>
      </div>
    </div>
  );
}
