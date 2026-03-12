import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DynamicFieldConfig } from "@jvse/dynamo-core";
import { DynamicField } from "@jvse/dynamo-react";
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

function FormCanvasInner({ fields, layout, selectedFieldId, onSelectField, onRemoveField, onDuplicateField }: FormCanvasProps) {
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
    <div
      ref={setCanvasRef}
      className={cn(
        "flex-1 min-h-[400px] p-5 overflow-auto relative",
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
          Arraste ou clique nos componentes da esquerda para adicioná-los
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
          "min-h-20 p-3 rounded-[10px]",
          isOver
            ? "bg-[rgba(26,115,232,0.06)] border-2 border-dashed border-[#1a73e8]"
            : "bg-gray-50 border border-dashed border-gray-200"
        )}
      >
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children.length === 0 ? (
            <div className="text-gray-500 text-[13px] text-center p-4">
              Arraste campos para dentro do grupo
            </div>
          ) : (
              children.map((child) => (
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
            ))
          )}
        </SortableContext>
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
