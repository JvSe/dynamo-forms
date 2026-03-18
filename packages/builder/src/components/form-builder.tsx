import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { DynamicFieldConfig, FormStep } from "@jvseen/dynamo-core";
import { DynamicField } from "@jvseen/dynamo-react";
import { FormProvider, useForm } from "react-hook-form";
import { FieldPalette, getPaletteDragId, type PaletteDragData } from "./field-palette.js";
import { InlineSheetRoot, InlineSheetPortal, InlineSheetContent } from "./inline-sheet.js";
import { ImportTemplateModal } from "./import-template-modal.js";
import { FormCanvas } from "./form-canvas.js";
import { FieldSettingsPanel } from "./field-settings-panel.js";
import { createDefaultFieldConfig } from "../lib/default-field-config.js";
import { getPreviewDefaultValues } from "../lib/preview-default-values.js";
import { FIELD_TYPES } from "../constants/field-types.js";
import type { FieldType } from "../constants/field-types.js";
import {
  FORM_CANVAS_ID,
  CANVAS_TOP_DROP_ID,
  parseDropId,
} from "../constants/drop-ids.js";
import {
  ensureLayoutForFields,
  getLayoutForNewField,
  moveFieldLayout,
  removeFromLayout,
  type FieldLayout,
} from "../lib/layout-utils.js";
import {
  addFieldToGroup,
  findFieldParent,
  getFieldById,
  getAllRootFieldIds,
  getFlattenedFields,
  moveFieldWithinGroup,
  removeFieldFromGroup,
} from "../lib/group-utils.js";
import { cn } from "../lib/utils.js";

const PALETTE_PREFIX = "field-palette-";

function isPaletteDragId(id: string): id is string {
  return typeof id === "string" && id.startsWith(PALETTE_PREFIX);
}

function getFieldTypeFromPaletteId(id: string): FieldType | null {
  if (!isPaletteDragId(id)) return null;
  const rest = id.slice(PALETTE_PREFIX.length);
  const type = (rest.includes("-") ? rest.split("-")[0] : rest) as FieldType;
  return FIELD_TYPES.some((t) => t.type === type) ? type : null;
}

function DragOverlayField({ field }: { field: DynamicFieldConfig }) {
  const defaultValues = useMemo(
    () => getPreviewDefaultValues([field]),
    [field.id]
  );
  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });
  const { control, getValues, formState } = methods;
  const formValues = methods.watch();

  return (
    <FormProvider {...methods}>
        <div className="dyn:p-2.5 dyn:bg-white dyn:rounded-xl dyn:border dyn:border-gray-200 dyn:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)] dyn:min-w-[180px]">
        <DynamicField
          field={field}
          control={control}
          formValues={(formValues ?? getValues()) as Record<string, unknown>}
          formState={formState}
        />
      </div>
    </FormProvider>
  );
}

let _stepIdCounter = 0;
function createStep(stepNumber: number): FormStep {
  _stepIdCounter++;
  return {
    id: `step_${_stepIdCounter}_${Date.now()}`,
    title: `Step ${stepNumber}`,
  };
}

export type FormBuilderProps = {
  value: DynamicFieldConfig[];
  onChange: (value: DynamicFieldConfig[]) => void;
  onFinish?: (value: DynamicFieldConfig[]) => void;
  /** Form title shown in the center header (e.g. "Drafts/ Resignation form") */
  formTitle?: string;
  onFormTitleChange?: (title: string) => void;
  /** Called when user clicks Preview */
  onPreview?: () => void;
  /** Called when user clicks back arrow (optional) */
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** Controlled steps array */
  steps?: FormStep[];
  onStepsChange?: (steps: FormStep[]) => void;
  /** Whether multi-step mode is active */
  multiStepEnabled?: boolean;
  onMultiStepChange?: (enabled: boolean) => void;
};

export function FormBuilder({
  value,
  onChange,
  onFinish,
  formTitle: formTitleProp,
  onFormTitleChange,
  onPreview,
  onBack,
  className,
  style,
  steps: stepsProp,
  onStepsChange,
  multiStepEnabled: multiStepProp,
  onMultiStepChange,
}: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePaletteData, setActivePaletteData] = useState<PaletteDragData | null>(null);
  const [layout, setLayout] = useState<FieldLayout>({});
  const [internalTitle, setInternalTitle] = useState("Drafts/ Form");
  const formTitle = formTitleProp ?? internalTitle;
  const setFormTitle = onFormTitleChange ?? setInternalTitle;
  const [isDragging, setIsDragging] = useState(false);

  const [internalSteps, setInternalSteps] = useState<FormStep[]>([createStep(1)]);
  const [internalMultiStep, setInternalMultiStep] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const steps = stepsProp ?? internalSteps;
  const setSteps = onStepsChange ?? setInternalSteps;
  const multiStepEnabled = multiStepProp ?? internalMultiStep;
  const setMultiStepEnabled = onMultiStepChange ?? setInternalMultiStep;

  const handleToggleMultiStep = useCallback(() => {
    const next = !multiStepEnabled;
    setMultiStepEnabled(next);
    if (next) {
      if (steps.length === 0) {
        setSteps([createStep(1)]);
      }
      onChange(value.map((f) => ({
        ...f,
        config: { ...f.config, step: f.config.step ?? 0 },
      })));
    }
    setActiveStepIndex(0);
  }, [multiStepEnabled, steps.length, value, onChange, setSteps, setMultiStepEnabled]);

  const handleAddStep = useCallback(() => {
    const s = createStep(steps.length + 1);
    setSteps([...steps, s]);
    setActiveStepIndex(steps.length);
  }, [steps, setSteps]);

  const handleRemoveStep = useCallback(
    (index: number) => {
      if (steps.length <= 1) return;
      const nextSteps = steps.filter((_, i) => i !== index);
      const nextFields = value
        .filter((f) => (f.config.step ?? 0) !== index)
        .map((f) => {
          const s = f.config.step ?? 0;
          if (s > index) return { ...f, config: { ...f.config, step: s - 1 } };
          return f;
        });
      setSteps(nextSteps);
      onChange(nextFields);
      setActiveStepIndex((prev) => Math.min(prev, nextSteps.length - 1));
    },
    [steps, value, onChange, setSteps]
  );

  const handleRenameStep = useCallback(
    (index: number, title: string) => {
      setSteps(steps.map((s, i) => (i === index ? { ...s, title } : s)));
    },
    [steps, setSteps]
  );

  const rootIds = getAllRootFieldIds(value);
  useEffect(() => {
    setLayout((prev) => ensureLayoutForFields(prev, rootIds));
  }, [rootIds.join(",")]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const selectedField = selectedFieldId ? getFieldById(value, selectedFieldId) : undefined;

  const handleImportTemplate = useCallback(
    (fields: DynamicFieldConfig[], title?: string, steps?: FormStep[]) => {
      onChange(fields);
      setSelectedFieldId(null);
      if (title != null && title !== "") setFormTitle(title);
      if (steps != null && steps.length > 0) {
        setSteps(steps);
        // Do not call setMultiStepEnabled here: parent derives multiStepEnabled from steps.length > 1.
        // Calling it would trigger onMultiStepChange(true) which can overwrite steps with [step1, step2] when the parent still had 1 step (batched state).
      }
    },
    [onChange, setFormTitle, setSteps]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const idStr = String(event.active.id);
    setActiveId(idStr);
    const fromPalette = isPaletteDragId(idStr);
    setActivePaletteData(fromPalette ? (event.active.data.current as PaletteDragData) ?? null : null);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActivePaletteData(null);
      setIsDragging(false);
      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      const drop = parseDropId(overIdStr);

      if (isPaletteDragId(activeIdStr)) {
        const data = active.data.current as PaletteDragData | undefined;
        const fieldType = data?.fieldType ?? getFieldTypeFromPaletteId(activeIdStr);
        if (!fieldType) return;
        const overrides =
          data?.defaultLabel !== undefined || data?.defaultPlaceholder !== undefined
            ? { defaultLabel: data?.defaultLabel, defaultPlaceholder: data?.defaultPlaceholder }
            : undefined;
        const newField = createDefaultFieldConfig(fieldType, overrides);
        if (multiStepEnabled) {
          newField.config.step = activeStepIndex;
        }

        if (drop?.type === "group" && drop.groupId) {
          const next = addFieldToGroup(value, drop.groupId, newField);
          onChange(next);
          setSelectedFieldId(newField.id);
          return;
        }

        const rootIds = getAllRootFieldIds(value);

        if (drop?.type === "top") {
          const nextLayout: typeof layout = { ...layout, [newField.id]: { row: 0, col: 0 } };
          for (const id of rootIds) {
            const pos = nextLayout[id] ?? { row: 0, col: 0 };
            nextLayout[id] = { ...pos, row: pos.row + 1 };
          }
          nextLayout[newField.id] = { row: 0, col: 0 };
          setLayout(nextLayout);
          onChange([...value, newField]);
          setSelectedFieldId(newField.id);
          return;
        }

        if (drop?.type === "bottom" && drop.fieldId) {
          const { row, col, nextLayout } = getLayoutForNewField(layout, rootIds, { below: drop.fieldId });
          setLayout({ ...nextLayout, [newField.id]: { row, col } });
          onChange([...value, newField]);
          setSelectedFieldId(newField.id);
          return;
        }

        const { row, col, nextLayout } = getLayoutForNewField(layout, rootIds, "append");
        setLayout({ ...nextLayout, [newField.id]: { row, col } });
        onChange([...value, newField]);
        setSelectedFieldId(newField.id);
        return;
      }

      const parent = findFieldParent(value, activeIdStr);
      const isFromGroup = parent !== null;
      const movedField = getFieldById(value, activeIdStr);
      if (!movedField) return;

      if (isFromGroup && parent) {
        const overInSameGroup = parent.group.config.children?.some((c) => c.id === overIdStr);
        if (overInSameGroup) {
          const toIndex = parent.group.config.children!.findIndex((c) => c.id === overIdStr);
          const next = moveFieldWithinGroup(value, parent.group.id, activeIdStr, toIndex);
          onChange(next);
          setSelectedFieldId(movedField.id);
          return;
        }
      }

      if (
        drop?.type === "group" &&
        drop.groupId &&
        drop.groupId !== parent?.group.id &&
        drop.groupId !== activeIdStr
      ) {
        const without = isFromGroup
          ? removeFieldFromGroup(value, parent!.group.id, activeIdStr).fields
          : value.filter((f) => f.id !== activeIdStr);
        const next = addFieldToGroup(without, drop.groupId, movedField);
        onChange(next);
        if (isFromGroup) setLayout(removeFromLayout(layout, activeIdStr));
        setSelectedFieldId(movedField.id);
        return;
      }

      if (drop?.type === "canvas" && isFromGroup) {
        const { fields: nextFields, removed } = removeFieldFromGroup(value, parent!.group.id, activeIdStr);
        if (!removed) return;
        const rootIds = getAllRootFieldIds(nextFields);
        const { row, col, nextLayout } = getLayoutForNewField(layout, rootIds, "append");
        setLayout({ ...nextLayout, [removed.id]: { row, col } });
        onChange([...nextFields, removed]);
        setSelectedFieldId(removed.id);
        return;
      }

      if (drop?.type === "ungroup" && drop.groupId && isFromGroup && parent?.group.id === drop.groupId) {
        const { fields: nextFields, removed } = removeFieldFromGroup(value, parent.group.id, activeIdStr);
        if (!removed) return;
        const groupIndex = nextFields.findIndex((f) => f.id === drop.groupId);
        const insertIndex = groupIndex >= 0 ? groupIndex : nextFields.length;
        const next = [...nextFields.slice(0, insertIndex), removed, ...nextFields.slice(insertIndex)];
        let nextLayout: typeof layout;
        if (insertIndex === 0) {
          nextLayout = { [removed.id]: { row: 0, col: 0 } };
          for (const id of Object.keys(layout)) {
            const pos = layout[id] ?? { row: 0, col: 0 };
            nextLayout[id] = { ...pos, row: pos.row + 1 };
          }
        } else {
          const prevRootIds = getAllRootFieldIds(nextFields);
          const { row, col, nextLayout: updated } = getLayoutForNewField(layout, prevRootIds, {
            below: nextFields[insertIndex - 1]!.id,
          });
          nextLayout = { ...updated, [removed.id]: { row, col } };
        }
        setLayout(nextLayout);
        onChange(next);
        setSelectedFieldId(removed.id);
        return;
      }

      if (drop?.type === "top") {
        const rootIds = getAllRootFieldIds(value);
        const nextLayout = { ...layout };
        for (const id of rootIds) {
          if (id === activeIdStr) continue;
          const pos = nextLayout[id] ?? { row: 0, col: 0 };
          nextLayout[id] = { ...pos, row: pos.row + 1 };
        }
        nextLayout[activeIdStr] = { row: 0, col: 0 };
        setLayout(nextLayout);
        setSelectedFieldId(movedField.id);
        return;
      }

      if (drop?.type === "bottom" && drop.fieldId) {
        const targetInRoot = value.some((f) => f.id === drop.fieldId);
        if (!targetInRoot) return;
        if (isFromGroup) {
          const { fields: without } = removeFieldFromGroup(value, parent!.group.id, activeIdStr);
          const rootIds = getAllRootFieldIds(without);
          const nextLayout = moveFieldLayout(layout, rootIds, activeIdStr, { below: drop.fieldId });
          setLayout(nextLayout);
          onChange([...without, movedField]);
        } else {
          const rootIds = getAllRootFieldIds(value);
          const nextLayout = moveFieldLayout(layout, rootIds, activeIdStr, { below: drop.fieldId });
          setLayout(nextLayout);
        }
        setSelectedFieldId(movedField.id);
        return;
      }

      const overAsField = value.find((f) => f.id === overIdStr);
      if (overAsField && !isFromGroup && !drop) {
        const rootIds = getAllRootFieldIds(value);
        const nextLayout = moveFieldLayout(layout, rootIds, activeIdStr, { below: overIdStr });
        setLayout(nextLayout);
        setSelectedFieldId(movedField.id);
      }
    },
    [value, onChange, layout, multiStepEnabled, activeStepIndex]
  );

  const handleUpdateField = useCallback(
    (updated: DynamicFieldConfig) => {
      const parent = findFieldParent(value, updated.id);
      if (parent) {
        onChange(
          value.map((f) => {
            if (f.id !== parent.group.id || f.type !== "group") return f;
            const children = (f.config.children ?? []).map((c) =>
              c.id === updated.id ? updated : c
            );
            return { ...f, config: { ...f.config, children } };
          })
        );
      } else {
        onChange(value.map((f) => (f.id === updated.id ? updated : f)));
      }
    },
    [value, onChange]
  );

  const handleRemoveField = useCallback(
    (id: string) => {
      const parent = findFieldParent(value, id);
      if (parent) {
        const { fields: next } = removeFieldFromGroup(value, parent.group.id, id);
        onChange(next);
      } else {
        onChange(value.filter((f) => f.id !== id));
        setLayout((prev) => removeFromLayout(prev, id));
      }
      setSelectedFieldId((prev) => (prev === id ? null : prev));
    },
    [value, onChange]
  );

  const handleDuplicateField = useCallback(
    (id: string) => {
      const source = getFieldById(value, id);
      if (!source) return;
      const duplicate: DynamicFieldConfig = {
        ...source,
        id: `${source.type}_${Date.now()}`,
        config: { ...source.config },
      };
      const parent = findFieldParent(value, id);
      if (parent) {
        const next = addFieldToGroup(value, parent.group.id, duplicate);
        onChange(next);
      } else {
        const rootIds = getAllRootFieldIds(value);
        const { row, col, nextLayout } = getLayoutForNewField(layout, rootIds, { below: id });
        setLayout({ ...nextLayout, [duplicate.id]: { row, col } });
        onChange([...value, duplicate]);
      }
      setSelectedFieldId(duplicate.id);
    },
    [value, onChange, layout]
  );

  const handleMoveFieldOutOfGroup = useCallback(
    (groupId: string, fieldId: string) => {
      const parent = findFieldParent(value, fieldId);
      if (!parent || parent.group.id !== groupId) return;
      const { fields: nextFields, removed } = removeFieldFromGroup(value, groupId, fieldId);
      if (!removed) return;
      const groupIndex = nextFields.findIndex((f) => f.id === groupId);
      const insertIndex = groupIndex >= 0 ? groupIndex : nextFields.length;
      const next = [...nextFields.slice(0, insertIndex), removed, ...nextFields.slice(insertIndex)];
      let nextLayout: typeof layout;
      if (insertIndex === 0) {
        nextLayout = { [removed.id]: { row: 0, col: 0 } };
        for (const id of Object.keys(layout)) {
          const pos = layout[id] ?? { row: 0, col: 0 };
          nextLayout[id] = { ...pos, row: pos.row + 1 };
        }
      } else {
        const prevRootIds = getAllRootFieldIds(nextFields);
        const { row, col, nextLayout: updated } = getLayoutForNewField(layout, prevRootIds, {
          below: nextFields[insertIndex - 1]!.id,
        });
        nextLayout = { ...updated, [removed.id]: { row, col } };
      }
      setLayout(nextLayout);
      onChange(next);
      setSelectedFieldId(removed.id);
    },
    [value, onChange, layout]
  );

  const handleAddFromPalette = useCallback(
    (item: PaletteDragData) => {
      const newField = createDefaultFieldConfig(item.fieldType, {
        defaultLabel: item.defaultLabel,
        defaultPlaceholder: item.defaultPlaceholder,
      });
      if (multiStepEnabled) {
        newField.config.step = activeStepIndex;
      }
      const rootIds = getAllRootFieldIds(value);
      const { row, col, nextLayout } = getLayoutForNewField(layout, rootIds, "append");
      setLayout({ ...nextLayout, [newField.id]: { row, col } });
      onChange([...value, newField]);
      setSelectedFieldId(newField.id);
    },
    [value, onChange, layout, multiStepEnabled, activeStepIndex]
  );

  const activeField = activeId && !isPaletteDragId(activeId) ? getFieldById(value, activeId) : undefined;

  const displayFields = useMemo(
    () =>
      multiStepEnabled
        ? value.filter((f) => (f.config.step ?? 0) === activeStepIndex)
        : value,
    [value, multiStepEnabled, activeStepIndex]
  );
  const displayLayout = useMemo(() => layout, [layout]);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "dyn:grid dyn:grid-cols-[280px_1fr] dyn:h-screen dyn:max-h-screen dyn:rounded-2xl dyn:overflow-hidden dyn:shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
          className
        )}
        style={style}
      >
        <div className="dyn:bg-white dyn:border-r dyn:border-gray-200 dyn:overflow-y-auto dyn:flex dyn:flex-col dyn:min-h-0 dyn:shrink-0 dyn:w-[280px]">
          <FieldPalette onAddField={handleAddFromPalette} />
        </div>

        <div
          ref={canvasContainerRef}
          className="dyn:relative dyn:flex dyn:flex-col dyn:min-w-0 dyn:min-h-0 dyn:h-full dyn:bg-white dyn:overflow-hidden"
        >
          <div className="dyn:flex dyn:items-center dyn:justify-between dyn:py-4 dyn:px-6 dyn:bg-white dyn:border-b dyn:border-gray-200 dyn:shrink-0">
            <div className="dyn:flex dyn:items-center dyn:gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="dyn:flex dyn:items-center dyn:justify-center dyn:p-2 dyn:border-0 dyn:bg-transparent dyn:cursor-pointer dyn:rounded-lg dyn:text-gray-500"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="dyn:text-base dyn:font-semibold dyn:border-0 dyn:bg-transparent dyn:py-1.5 dyn:px-2.5 dyn:rounded-lg dyn:min-w-[220px] dyn:text-gray-900 dyn:outline-none"
              />
            </div>
            <div className="dyn:flex dyn:gap-3">
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="dyn:py-2.5 dyn:px-4 dyn:text-sm dyn:font-medium dyn:cursor-pointer dyn:bg-white dyn:border dyn:border-gray-300 dyn:text-gray-700 dyn:rounded-[10px] dyn:hover:bg-gray-50"
              >
                Importar JSON
              </button>
              {onPreview && (
                <button
                  type="button"
                  onClick={onPreview}
                  className="dyn:py-2.5 dyn:px-5 dyn:text-sm dyn:font-medium dyn:cursor-pointer dyn:bg-gray-100 dyn:text-gray-900 dyn:border-0 dyn:rounded-[10px]"
                >
                  Preview
                </button>
              )}
              {onFinish && (
                <button
                  type="button"
                  onClick={() => onFinish(value)}
                  className="dyn:py-2.5 dyn:px-5 dyn:text-sm dyn:font-medium dyn:cursor-pointer dyn:bg-[#1a73e8] dyn:text-white dyn:border-0 dyn:rounded-[10px]"
                >
                  Publish
                </button>
              )}
            </div>
          </div>

          <div
            className={cn(
              "dyn:relative dyn:flex-1 dyn:min-h-0 dyn:flex dyn:flex-col dyn:overflow-hidden dyn:transition-[margin-right] dyn:duration-200 dyn:ease-out",
              selectedField ? "dyn:mr-[320px]" : "dyn:mr-0"
            )}
          >
            <FormCanvas
              fields={displayFields}
              layout={displayLayout}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onRemoveField={handleRemoveField}
              onDuplicateField={handleDuplicateField}
              onMoveFieldOutOfGroup={handleMoveFieldOutOfGroup}
              multiStepEnabled={multiStepEnabled}
              steps={steps}
              activeStepIndex={activeStepIndex}
              onStepChange={setActiveStepIndex}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
              onRenameStep={handleRenameStep}
              onToggleMultiStep={handleToggleMultiStep}
            />
          </div>

          <InlineSheetRoot
            open={!!selectedField}
            containerRef={canvasContainerRef}
          >
            <InlineSheetPortal>
              <InlineSheetContent
                side="right"
                className={isDragging ? "dyn:pointer-events-none" : undefined}
              >
                {selectedField && (
                  <>
                    <div className="dyn:flex-1 dyn:overflow-auto dyn:flex dyn:flex-col">
                      <FieldSettingsPanel
                        field={selectedField}
                        allFields={getFlattenedFields(value)}
                        onChange={handleUpdateField}
                        onRemove={() => selectedFieldId && handleRemoveField(selectedFieldId)}
                      />
                    </div>
                    <div className="dyn:p-4 dyn:border-t dyn:border-gray-200 dyn:shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedFieldId(null)}
                        className="dyn:w-full dyn:py-2.5 dyn:px-5 dyn:text-sm dyn:font-medium dyn:cursor-pointer dyn:bg-[#1a73e8] dyn:text-white dyn:border-0 dyn:rounded-[10px]"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </InlineSheetContent>
            </InlineSheetPortal>
          </InlineSheetRoot>
        </div>
      </div>

      <ImportTemplateModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportTemplate}
      />

      <DragOverlay>
        {activeField ? (
          <DragOverlayField field={activeField} />
        ) : activeId && isPaletteDragId(activeId) && activePaletteData ? (
          <DragOverlayField
            field={createDefaultFieldConfig(activePaletteData.fieldType, {
              defaultLabel: activePaletteData.label,
              defaultPlaceholder: activePaletteData.defaultPlaceholder,
            })}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
