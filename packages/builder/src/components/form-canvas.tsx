import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DynamicFieldConfig, FormStep } from "@jvseen/dynamo-core";
import { DynamicField } from "@jvseen/dynamo-react";
import { FieldCard } from "./field-card.js";
import { getPreviewDefaultValues } from "../lib/preview-default-values.js";
import type { FieldLayout } from "../lib/layout-utils.js";
import { FORM_CANVAS_ID, CANVAS_TOP_DROP_ID, dropBottomId, dropUngroupId, groupChildrenId } from "../constants/drop-ids.js";
import { cn } from "../lib/utils.js";

export { FORM_CANVAS_ID };

type FormCanvasProps = {
  fields: DynamicFieldConfig[];
  layout: FieldLayout;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onRemoveField?: (id: string) => void;
  onDuplicateField?: (id: string) => void;
  onMoveFieldOutOfGroup?: (groupId: string, fieldId: string) => void;
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
        "dyn:min-h-2 dyn:min-w-2 dyn:rounded dyn:transition-colors dyn:duration-150",
        isOver ? "dyn:bg-[rgba(26,115,232,0.15)]" : "dyn:bg-transparent",
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
    <div className="dyn:flex dyn:items-center dyn:gap-2 dyn:px-5 dyn:py-2 dyn:border-b dyn:border-border dyn:bg-muted/60 dyn:min-h-0">
      <div className="dyn:flex-1 dyn:min-w-0 dyn:overflow-x-auto dyn:overflow-y-hidden dyn:flex dyn:items-center dyn:gap-1.5 dyn:py-0.5">
        <SortableContext
          items={steps.map((step) => `step-tab-${step.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {steps.map((step, i) => (
            <StepTabItem
              key={step.id}
              step={step}
              index={i}
              activeStepIndex={activeStepIndex}
              editingIndex={editingIndex}
              renameValue={renameValue}
              stepsLength={steps.length}
              onRenameValueChange={setRenameValue}
              onCommitRename={commitRename}
              onCancelRename={() => setEditingIndex(null)}
              onStartRename={startRename}
              onStepChange={onStepChange}
              onRemoveStep={onRemoveStep}
            />
          ))}
        </SortableContext>
      </div>

      <button
        type="button"
        onClick={onAddStep}
        className="dyn:flex dyn:items-center dyn:justify-center dyn:w-7 dyn:h-7 dyn:rounded-md dyn:text-muted-foreground dyn:hover:text-foreground dyn:hover:bg-muted dyn:transition-colors dyn:cursor-pointer dyn:border-0 dyn:bg-transparent dyn:shrink-0"
        title="Add step"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <div className="dyn:shrink-0 dyn:flex dyn:items-center dyn:gap-2 dyn:pl-2 dyn:border-l dyn:border-border">
        <span className="dyn:text-[11px] dyn:text-muted-foreground dyn:whitespace-nowrap">
          {fieldCount} field{fieldCount !== 1 ? "s" : ""} · step {activeStepIndex + 1}/{steps.length}
        </span>
        {onToggleMultiStep && (
          <button
            type="button"
            onClick={onToggleMultiStep}
            className="dyn:text-[11px] dyn:text-muted-foreground dyn:hover:text-foreground dyn:cursor-pointer dyn:border-0 dyn:bg-transparent dyn:underline dyn:whitespace-nowrap"
          >
            Disable steps
          </button>
        )}
      </div>
    </div>
  );
}

type StepTabItemProps = {
  step: FormStep;
  index: number;
  activeStepIndex: number;
  editingIndex: number | null;
  renameValue: string;
  stepsLength: number;
  onRenameValueChange: (value: string) => void;
  onCommitRename: (index: number) => void;
  onCancelRename: () => void;
  onStartRename: (index: number) => void;
  onStepChange: (index: number) => void;
  onRemoveStep: (index: number) => void;
};

function StepTabItem({
  step,
  index,
  activeStepIndex,
  editingIndex,
  renameValue,
  stepsLength,
  onRenameValueChange,
  onCommitRename,
  onCancelRename,
  onStartRename,
  onStepChange,
  onRemoveStep,
}: StepTabItemProps) {
  const sortable = useSortable({
    id: `step-tab-${step.id}`,
    data: { type: "step-tab", stepIndex: index },
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className="dyn:flex dyn:items-center dyn:shrink-0"
    >
      {editingIndex === index ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameValueChange(e.target.value)}
          onBlur={() => onCommitRename(index)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitRename(index);
            if (e.key === "Escape") onCancelRename();
          }}
          className="dyn:px-2 dyn:py-1 dyn:rounded-md dyn:text-xs dyn:font-medium dyn:bg-background dyn:border dyn:border-primary dyn:text-foreground dyn:w-24 dyn:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => onStepChange(index)}
          onDoubleClick={() => onStartRename(index)}
          {...sortable.attributes}
          {...sortable.listeners}
          className={cn(
            "dyn:group dyn:flex dyn:items-center dyn:gap-1.5 dyn:px-3 dyn:py-1.5 dyn:rounded-md dyn:text-xs dyn:font-medium dyn:transition-all dyn:cursor-grab active:dyn:cursor-grabbing dyn:border-0",
            activeStepIndex === index
              ? "dyn:bg-primary/20 dyn:text-primary"
              : "dyn:text-muted-foreground dyn:hover:text-foreground dyn:hover:bg-muted dyn:bg-transparent"
          )}
        >
          <span
            className={cn(
              "dyn:flex dyn:items-center dyn:justify-center dyn:min-w-5 dyn:h-5 dyn:px-1 dyn:rounded-full dyn:text-[10px] dyn:font-semibold dyn:shrink-0",
              activeStepIndex === index
                ? "dyn:bg-primary dyn:text-primary-foreground"
                : "dyn:bg-muted dyn:text-muted-foreground"
            )}
          >
            {index + 1}
          </span>
          <span className="dyn:truncate dyn:max-w-[120px]">{step.title}</span>
          {stepsLength > 1 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onRemoveStep(index);
              }}
              className="dyn:ml-0.5 dyn:opacity-0 dyn:group-hover:opacity-100 dyn:hover:text-red-500 dyn:transition-all dyn:cursor-pointer dyn:shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
          )}
        </button>
      )}
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
  onMoveFieldOutOfGroup,
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
    <div className="dyn:flex dyn:flex-col dyn:flex-1 dyn:min-h-0 dyn:w-full">
      {multiStepEnabled && steps && steps.length > 0 && onStepChange && onAddStep && onRemoveStep && onRenameStep && (
        <div className="dyn:shrink-0">
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
        <div className="dyn:shrink-0 dyn:flex dyn:items-center dyn:justify-end dyn:px-5 dyn:py-1.5 dyn:border-b dyn:border-border">
          <button
            type="button"
            onClick={onToggleMultiStep}
            className="dyn:text-[11px] dyn:text-muted-foreground dyn:hover:text-primary dyn:cursor-pointer dyn:border-0 dyn:bg-transparent"
          >
            + Enable steps
          </button>
        </div>
      )}
      <div
        ref={setCanvasRef}
        className={cn(
          "dyn:flex-1 dyn:min-h-0 dyn:p-5 dyn:overflow-y-auto dyn:overflow-x-hidden dyn:relative",
          isOver && "dyn:shadow-[inset_0_0_0_2px_rgba(26,115,232,0.3)]"
        )}
        style={{
          backgroundColor: isOver ? "hsl(var(--dyn-card))" : "hsl(var(--dyn-background))",
          backgroundImage: "radial-gradient(circle, hsl(var(--dyn-border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {fields.length === 0 ? (
        <div className="dyn:text-muted-foreground dyn:text-sm dyn:p-12 dyn:text-center dyn:border-2 dyn:border-dashed dyn:border-border dyn:rounded-xl dyn:bg-card dyn:relative dyn:z-1">
          Drag or click components from the left to add them
        </div>
      ) : (
        <>
          <DropZone id={CANVAS_TOP_DROP_ID} className="dyn:w-full dyn:h-3 dyn:mb-0.5" />

          {sortedByLayout.map((field) => (
            <React.Fragment key={field.id}>
              {field.type === "group" && (
                <DropZone
                  id={dropUngroupId(field.id)}
                  className="dyn:w-full dyn:min-h-10 dyn:mb-2 dyn:flex dyn:items-center dyn:justify-center dyn:rounded-lg dyn:border-2 dyn:border-dashed dyn:border-border dyn:bg-muted dyn:text-xs dyn:font-medium dyn:text-muted-foreground dyn:transition-colors hover:dyn:border-primary hover:dyn:bg-primary/10 hover:dyn:text-primary"
                >
                  ← Solte aqui para mover campo para fora do grupo
                </DropZone>
              )}
              <div className="dyn:w-full">
                {field.type === "group" ? (
                  <GroupBlock
                    field={field}
                    selectedFieldId={selectedFieldId}
                    onSelectField={onSelectField}
                    onRemoveField={onRemoveField}
                    onDuplicateField={onDuplicateField}
                    onMoveFieldOutOfGroup={onMoveFieldOutOfGroup}
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
              <DropZone id={dropBottomId(field.id)} className="dyn:w-full dyn:h-3 dyn:mb-0.5" />
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
  onMoveFieldOutOfGroup?: (groupId: string, fieldId: string) => void;
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
  onMoveFieldOutOfGroup,
  control,
  formValues,
  formState,
}: GroupBlockProps) {
  const { setNodeRef, isOver } = useDroppable({ id: groupChildrenId(field.id) });
  const children = field.type === "group" ? (field.config.children ?? []) : [];
  const groupId = field.id;

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
          "dyn:min-h-[7rem] dyn:flex dyn:flex-col dyn:gap-3 dyn:p-3 dyn:rounded-[10px]",
          isOver
            ? "dyn:bg-primary/10 dyn:border-2 dyn:border-dashed dyn:border-primary"
            : "dyn:bg-muted dyn:border dyn:border-dashed dyn:border-border"
        )}
      >
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children.length === 0 ? (
            <div className="dyn:flex-1 dyn:flex dyn:items-center dyn:justify-center dyn:text-muted-foreground dyn:text-[13px] dyn:text-center dyn:py-6 dyn:px-4">
              Arraste campos para cá ou solte abaixo
            </div>
          ) : (
            <div className="dyn:flex dyn:flex-col dyn:gap-3">
                {children.map((child) => (
                <FieldCard
                  key={child.id}
                  field={child}
                  isSelected={selectedFieldId === child.id}
                  onSelect={() => onSelectField(child.id)}
                  onRemove={onRemoveField ? () => onRemoveField(child.id) : undefined}
                  onDuplicate={onDuplicateField ? () => onDuplicateField(child.id) : undefined}
                  onMoveOutOfGroup={
                    onMoveFieldOutOfGroup ? () => onMoveFieldOutOfGroup(groupId, child.id) : undefined
                  }
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
            "dyn:shrink-0 dyn:py-2 dyn:px-3 dyn:rounded-md dyn:text-center dyn:text-xs dyn:font-medium dyn:transition-colors",
            isOver
              ? "dyn:bg-[#1a73e8]/15 dyn:text-[#1a73e8]"
              : "dyn:bg-muted dyn:text-muted-foreground"
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
