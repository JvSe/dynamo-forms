import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DynamicFieldConfig, FormStep } from "@jvseen/dynamo-core";
import { DynamicField } from "@jvseen/dynamo-react";
import { FieldCard } from "./field-card.js";
import { getPreviewDefaultValues } from "../lib/preview-default-values.js";
import type { FieldLayout } from "../lib/layout-utils.js";
import { FORM_CANVAS_ID, CANVAS_TOP_DROP_ID, dropBottomId, groupChildrenId } from "../constants/drop-ids.js";
import { cn } from "../lib/utils.js";

export { FORM_CANVAS_ID };

type FormCanvasProps = {
  fields: DynamicFieldConfig[];
  layout: FieldLayout;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onRemoveField?: (id: string) => void;
  onDuplicateField?: (id: string) => void;
  multiStepEnabled?: boolean;
  steps?: FormStep[];
  activeStepIndex?: number;
  onStepChange?: (index: number) => void;
  onAddStep?: () => void;
  onRemoveStep?: (index: number) => void;
  onRenameStep?: (index: number, title: string) => void;
  onToggleMultiStep?: () => void;
};

function DropZone({
  id,
  children,
  className,
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-2 min-w-2 rounded transition-colors duration-150",
        isOver ? "bg-[rgba(26,115,232,0.15)]" : "bg-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}

function StepTabs({
  steps,
  activeStepIndex,
  onStepChange,
  onAddStep,
  onRemoveStep,
  onRenameStep,
  onToggleMultiStep,
  fieldCount,
}: {
  steps: FormStep[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onRenameStep: (index: number, title: string) => void;
  onToggleMultiStep?: () => void;
  fieldCount: number;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const startRename = (index: number) => {
    setEditingIndex(index);
    setRenameValue(steps[index].title);
  };

  const commitRename = (index: number) => {
    if (renameValue.trim()) onRenameStep(index, renameValue.trim());
    setEditingIndex(null);
  };

  return (
    <div className="flex items-center gap-2 px-5 py-2 border-b border-gray-200 bg-gray-50/60 min-h-0">
      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden flex items-center gap-1.5 py-0.5">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center shrink-0">
            {editingIndex === i ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => commitRename(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(i);
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                className="px-2 py-1 rounded-md text-xs font-medium bg-white border border-blue-400 text-gray-900 w-24 outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => onStepChange(i)}
                onDoubleClick={() => startRename(i)}
                className={cn(
                  "group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-0",
                  activeStepIndex === i
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-transparent"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold shrink-0",
                  activeStepIndex === i
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                )}>
                  {i + 1}
                </span>
                <span className="truncate max-w-[120px]">{step.title}</span>
                {steps.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStep(i);
                    }}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all cursor-pointer shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddStep}
        className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
        title="Add step"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <div className="shrink-0 flex items-center gap-2 pl-2 border-l border-gray-200">
        <span className="text-[11px] text-gray-400 whitespace-nowrap">
          {fieldCount} field{fieldCount !== 1 ? "s" : ""} · step {activeStepIndex + 1}/{steps.length}
        </span>
        {onToggleMultiStep && (
          <button
            type="button"
            onClick={onToggleMultiStep}
            className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent underline whitespace-nowrap"
          >
            Disable steps
          </button>
        )}
      </div>
    </div>
  );
}

function FormCanvasInner({
  fields,
  layout,
  selectedFieldId,
  onSelectField,
  onRemoveField,
  onDuplicateField,
  multiStepEnabled,
  steps,
  activeStepIndex,
  onStepChange,
  onAddStep,
  onRemoveStep,
  onRenameStep,
  onToggleMultiStep,
}: FormCanvasProps) {
  const { setNodeRef: setCanvasRef, isOver } = useDroppable({ id: FORM_CANVAS_ID });
  const { control, getValues, formState } = useFormContext();
  const formValues = useWatch({ control, defaultValue: getValues() }) as Record<string, unknown>;

  const sortedByLayout = useMemo(() => {
    const root = [...fields];
    return root.sort((a, b) => {
      const la = layout[a.id] ?? { row: 0, col: 0 };
      const lb = layout[b.id] ?? { row: 0, col: 0 };
      if (la.row !== lb.row) return la.row - lb.row;
      return la.col - lb.col;
    });
  }, [fields, layout]);

  const byRow = useMemo(() => {
    const map: Record<number, DynamicFieldConfig[]> = {};
    for (const f of sortedByLayout) {
      const r = (layout[f.id] ?? { row: 0, col: 0 }).row;
      if (!map[r]) map[r] = [];
      map[r].push(f);
    }
    return map;
  }, [sortedByLayout, layout]);

  const rows = useMemo(() => {
    const keys = Object.keys(byRow).map(Number).sort((a, b) => a - b);
    return keys.length ? keys : [0];
  }, [byRow]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {multiStepEnabled && steps && steps.length > 0 && onStepChange && onAddStep && onRemoveStep && onRenameStep && (
        <div className="shrink-0">
          <StepTabs
          steps={steps}
          activeStepIndex={activeStepIndex ?? 0}
          onStepChange={onStepChange}
          onAddStep={onAddStep}
          onRemoveStep={onRemoveStep}
          onRenameStep={onRenameStep}
          onToggleMultiStep={onToggleMultiStep}
          fieldCount={fields.length}
        />
        </div>
      )}
      {!multiStepEnabled && onToggleMultiStep && (
        <div className="shrink-0 flex items-center justify-end px-5 py-1.5 border-b border-gray-100">
          <button
            type="button"
            onClick={onToggleMultiStep}
            className="text-[11px] text-gray-400 hover:text-blue-600 cursor-pointer border-0 bg-transparent"
          >
            + Enable steps
          </button>
        </div>
      )}
      <div
        ref={setCanvasRef}
        className={cn(
          "flex-1 min-h-0 p-5 overflow-y-auto overflow-x-hidden relative",
          isOver && "shadow-[inset_0_0_0_2px_rgba(26,115,232,0.3)]"
        )}
        style={{
          backgroundColor: isOver ? "rgba(255,255,255,0.95)" : "#fff",
          backgroundImage: "radial-gradient(circle, #e0e0e0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {fields.length === 0 ? (
        <div className="text-gray-500 text-sm p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white relative z-1">
          Drag or click components from the left to add them
        </div>
      ) : (
        <>
          <DropZone id={CANVAS_TOP_DROP_ID} className="w-full h-3 mb-0.5" />

          {sortedByLayout.map((field) => (
            <React.Fragment key={field.id}>
              <div className="w-full">
                {field.type === "group" ? (
                  <GroupBlock
                    field={field}
                    selectedFieldId={selectedFieldId}
                    onSelectField={onSelectField}
                    onRemoveField={onRemoveField}
                    onDuplicateField={onDuplicateField}
                    control={control}
                    formValues={formValues ?? {}}
                    formState={formState}
                  />
                ) : (
                  <FieldCard
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => onSelectField(field.id)}
                    onRemove={onRemoveField ? () => onRemoveField(field.id) : undefined}
                    onDuplicate={onDuplicateField ? () => onDuplicateField(field.id) : undefined}
                    mode="draggable"
                  >
                    <DynamicField
                      field={field}
                      control={control}
                      formValues={formValues ?? {}}
                      formState={formState}
                      ignoreConditions
                      hideLabel
                    />
                  </FieldCard>
                )}
              </div>
              <DropZone id={dropBottomId(field.id)} className="w-full h-3 mb-0.5" />
            </React.Fragment>
          ))}
        </>
      )}
      </div>
    </div>
  );
}

type GroupBlockProps = {
  field: DynamicFieldConfig;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onRemoveField?: (id: string) => void;
  onDuplicateField?: (id: string) => void;
  control: any;
  formValues: Record<string, unknown>;
  formState: any;
};

function GroupBlock({
  field,
  selectedFieldId,
  onSelectField,
  onRemoveField,
  onDuplicateField,
  control,
  formValues,
  formState,
}: GroupBlockProps) {
  const { setNodeRef, isOver } = useDroppable({ id: groupChildrenId(field.id) });
  const children = field.type === "group" ? (field.config.children ?? []) : [];

  return (
    <FieldCard
      field={field}
      isSelected={selectedFieldId === field.id}
      onSelect={() => onSelectField(field.id)}
      onRemove={onRemoveField ? () => onRemoveField(field.id) : undefined}
      onDuplicate={onDuplicateField ? () => onDuplicateField(field.id) : undefined}
      mode="draggable"
    >
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[7rem] flex flex-col gap-3 p-3 rounded-[10px]",
          isOver
            ? "bg-[rgba(26,115,232,0.08)] border-2 border-dashed border-[#1a73e8]"
            : "bg-gray-50 border border-dashed border-gray-200"
        )}
      >
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-[13px] text-center py-6 px-4">
              Arraste campos para cá ou solte abaixo
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {children.map((child) => (
                <FieldCard
                  key={child.id}
                  field={child}
                  isSelected={selectedFieldId === child.id}
                  onSelect={() => onSelectField(child.id)}
                  onRemove={onRemoveField ? () => onRemoveField(child.id) : undefined}
                  onDuplicate={onDuplicateField ? () => onDuplicateField(child.id) : undefined}
                  mode="sortable"
                >
                  <DynamicField
                    field={child}
                    control={control}
                    formValues={formValues}
                    formState={formState}
                    ignoreConditions
                    hideLabel
                  />
                </FieldCard>
              ))}
            </div>
          )}
        </SortableContext>
        <div
          className={cn(
            "shrink-0 py-2 px-3 rounded-md text-center text-xs font-medium transition-colors",
            isOver
              ? "bg-[#1a73e8]/15 text-[#1a73e8]"
              : "bg-gray-100/80 text-gray-500"
          )}
        >
          Solte aqui para adicionar ao grupo
        </div>
      </div>
    </FieldCard>
  );
}

export { type FormCanvasProps };

export function FormCanvas(props: FormCanvasProps) {
  const defaultValues = useMemo(
    () => getPreviewDefaultValues(props.fields),
    [props.fields]
  );

  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  return (
    <FormProvider {...methods}>
      <FormCanvasInner {...props} />
    </FormProvider>
  );
}
