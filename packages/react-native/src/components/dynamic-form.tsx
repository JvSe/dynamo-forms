import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { FlashList } from "@shopify/flash-list";
import {
  Keyboard,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import {
  findFieldInGroups,
  findFirstErrorFieldId,
  getFieldStatus,
  getInitialValuesFromRegister,
  processFieldsForSubmission,
  collectErrorFieldsInfo,
  buildZodSchema,
  clearConditionCacheForField,
  type DynamicFieldConfig,
  type ErrorFieldInfo,
  type FormStep,
  type FormUpload,
} from "@jvseen/dynamo-core";
import { scrollToFirstError as scrollToFirstErrorUtil } from "../form-scroll.js";
import { FormPerformanceSampler } from "../lib/performance-budget.js";
import { DynamicField, type ComponentOverridesMap } from "./dynamic-field.js";
import { FormFooter, type ActionsButtonProps } from "./form-footer.js";
import { FormHeader } from "./form-header.js";
import { StepIndicator } from "./step-indicator.js";
import { ValidationModal } from "./validation-modal.js";

// --- Context (composition) -------------------------------------------------

export type DynamicFormContextValue = {
  fields: DynamicFieldConfig[];
  visibleFields: DynamicFieldConfig[];
  steps?: FormStep[];
  formId: string;
  formName: string;
  scrollEnabled: boolean;

  isSubmitting: boolean;
  isValidating: boolean;
  setIsValidating: React.Dispatch<React.SetStateAction<boolean>>;

  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isMultiStep: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;

  methods: ReturnType<typeof useForm>;
  allValues: Record<string, any>;
  lastChangedField?: string;
  lastBlurredField?: string;

  fieldListRef: React.RefObject<FlashList<DynamicFieldConfig> | null>;
  fieldPositionsRef: React.MutableRefObject<Map<string, number>>;
  registerFieldPosition: (fieldId: string, y: number) => void;
  getParentYPosition: (fieldId: string) => number | undefined;

  handleFieldBlur: (fieldId: string) => void;
  getFieldStatusCallback: (fieldId: string) => ReturnType<typeof getFieldStatus>;

  handleNextStep: () => Promise<void>;
  handleBackStep: () => void;
  handleSubmitWithValidation: () => void | Promise<void>;
};

const DynamicFormCompositionContext = createContext<
  DynamicFormContextValue | undefined
>(undefined);

export function useDynamicFormComposition() {
  const ctx = useContext(DynamicFormCompositionContext);
  if (!ctx) {
    throw new Error(
      "useDynamicFormComposition must be used within DynamicFormProvider"
    );
  }
  return ctx;
}

// --- Provider props (same as web) ------------------------------------------

export type DynamicFormProviderProps = {
  fields: DynamicFieldConfig[];
  formId: string;
  formName: string;
  scrollEnabled?: boolean;
  initialValues?: Record<string, any>;
  registerSelected?: Record<string, any> | null;
  onSubmit: (data: {
    dados: Record<string, any>;
    uploads: FormUpload[];
  }) => void | Promise<void>;
  onSubmitError?: (error: Error) => void;
  onValidationError?: (errors: ErrorFieldInfo[]) => void;
  onFormDataChange?: (data: Record<string, any>) => void;
  onFormDirtyChange?: (dirty: boolean) => void;
  steps?: FormStep[];
  children: React.ReactNode;
};

// --- DynamicFormProvider ---------------------------------------------------

export const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
  fields,
  formId,
  formName,
  scrollEnabled = true,
  initialValues = {},
  registerSelected = null,
  onSubmit,
  onSubmitError,
  onValidationError,
  onFormDataChange,
  onFormDirtyChange,
  steps,
  children,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isMultiStep = !!(steps && steps.length > 1);
  const isFirstStep = currentStep === 0;
  const isLastStep =
    !isMultiStep || currentStep === (steps?.length ?? 1) - 1;
  const visibleFields = useMemo(() => {
    if (!isMultiStep) return fields;
    return fields.filter((f) => (f.config.step ?? 0) === currentStep);
  }, [fields, isMultiStep, currentStep]);
  const getStepFieldIds = useCallback(
    (stepIndex: number) =>
      fields
        .filter((f) => (f.config.step ?? 0) === stepIndex)
        .map((f) => f.id),
    [fields]
  );

  const initialSchema = useMemo(
    () => buildZodSchema(fields, initialValues),
    [fields, initialValues]
  );

  const [zodResolverDynamic, setZodResolverDynamic] = useState(initialSchema);

  const methods = useForm({
    resolver: zodResolver(zodResolverDynamic),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  const perfSampler = useRef(new FormPerformanceSampler());

  useEffect(() => {
    perfSampler.current.startFrameTracking();
    return () => perfSampler.current.stopFrameTracking();
  }, []);

  const hasInitializedFromRegister = useRef(false);
  const fieldListRef = useRef<FlashList<DynamicFieldConfig>>(null);
  const fieldPositionsRef = useRef<Map<string, number>>(new Map());

  const allValues = useWatch({ control: methods.control });
  const previousValues = useRef<Record<string, any>>({});
  const [lastChangedField, setLastChangedField] = useState<string | undefined>();
  const [lastBlurredField, setLastBlurredField] = useState<string | undefined>();
  const conditionalFieldsAddedRef = useRef<Set<string>>(new Set());

  const dynamicSchema = useMemo(
    () => buildZodSchema(fields, allValues),
    [fields, allValues]
  );
  const previousSchemaFieldsRef = useRef<Set<string>>(new Set());

  const ensureScrollToError = useCallback(
    async (
      firstErrorFieldId: string,
      errorFieldIds: string[]
    ): Promise<boolean> => {
      if (!fieldListRef.current || !firstErrorFieldId) {
        return false;
      }

      let targetIndex: number | null = null;

      for (let i = 0; i < visibleFields.length; i++) {
        const field = visibleFields[i];

        if (field.id === firstErrorFieldId) {
          targetIndex = i;
          break;
        }

        if (field.type === "group" && field.config.children) {
          const hasError =
            findFirstErrorFieldId(field.config.children, errorFieldIds) ===
            firstErrorFieldId;
          if (hasError) {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex === null) {
        return false;
      }

      const scrollByIndex = async (): Promise<boolean> => {
        return new Promise((resolve) => {
          let attempts = 0;
          const maxAttempts = 5;

          const tryScroll = () => {
            attempts++;

            if (!fieldListRef.current) {
              resolve(false);
              return;
            }

            try {
              fieldListRef.current.scrollToIndex({
                index: targetIndex!,
                animated: true,
                viewPosition: 0.1,
              });

              setTimeout(() => {
                const fieldY =
                  fieldPositionsRef.current.get(firstErrorFieldId);

                if (fieldY !== undefined || attempts >= maxAttempts) {
                  resolve(true);
                } else {
                  setTimeout(tryScroll, 300 * attempts);
                }
              }, 400);
            } catch {
              if (attempts < maxAttempts) {
                setTimeout(tryScroll, 300 * attempts);
              } else {
                resolve(false);
              }
            }
          };

          tryScroll();
        });
      };

      const scrollByOffset = (): boolean => {
        const fieldY = fieldPositionsRef.current.get(firstErrorFieldId);

        if (fieldY !== undefined && fieldListRef.current) {
          try {
            const scrollOffset = Math.max(0, fieldY - 100);
            fieldListRef.current.scrollToOffset({
              offset: scrollOffset,
              animated: true,
            });
            return true;
          } catch {
            return false;
          }
        }

        return false;
      };

      if (scrollByOffset()) {
        return true;
      }

      return await scrollByIndex();
    },
    [visibleFields]
  );

  useEffect(() => {
    if (registerSelected && !hasInitializedFromRegister.current) {
      const currentFormValues = methods.getValues();
      const registerInitialValues = getInitialValuesFromRegister(
        fields,
        registerSelected as any,
        currentFormValues
      );

      if (Object.keys(registerInitialValues).length > 0) {
        methods.reset(registerInitialValues);
        onFormDataChange?.(registerInitialValues);
        hasInitializedFromRegister.current = true;

        setTimeout(() => {
          Object.keys(registerInitialValues).forEach((fieldId) => {
            clearConditionCacheForField(fieldId);
          });

          const fieldIds = Object.entries(registerInitialValues)
            .filter(
              ([_, value]) =>
                value !== undefined && value !== null && value !== ""
            )
            .map(([fieldId]) => fieldId);

          const processBatches = async () => {
            const BATCH_SIZE = 20;
            const batches: string[][] = [];

            for (let i = 0; i < fieldIds.length; i += BATCH_SIZE) {
              batches.push(fieldIds.slice(i, i + BATCH_SIZE));
            }

            for (let i = 0; i < batches.length; i++) {
              const batch = batches[i];

              batch.forEach((fieldId) => {
                setLastChangedField(fieldId);
                setLastBlurredField(fieldId);
              });

              if (i < batches.length - 1) {
                await new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 50)
                );
              }
            }

            await new Promise<void>((resolve) => setTimeout(() => resolve(), 50));
            await methods.trigger();

            setLastChangedField(undefined);
            setLastBlurredField(undefined);
          };

          processBatches();
        }, 100);
      }
    }

    if (!registerSelected) {
      hasInitializedFromRegister.current = false;
    }
  }, [registerSelected, fields, methods, onFormDataChange]);

  useEffect(() => {
    const newResolver = zodResolver(dynamicSchema);

    const formMethods = methods as any;
    if (formMethods._options) {
      formMethods._options.resolver = newResolver;
    }

    const currentSchemaFields = new Set(Object.keys(dynamicSchema.shape));
    const previousFields = previousSchemaFieldsRef.current;

    const fieldsAdded = [...currentSchemaFields].filter(
      (field) => !previousFields.has(field)
    );
    const fieldsRemoved = [...previousFields].filter(
      (field) => !currentSchemaFields.has(field)
    );
    const schemaFieldsChanged =
      fieldsAdded.length > 0 || fieldsRemoved.length > 0;

    if (schemaFieldsChanged) {
      fieldsRemoved.forEach((field) => {
        methods.clearErrors(field);
        methods.unregister(field);
      });

      if (fieldsAdded.length > 0) {
        fieldsAdded.forEach((fieldId) => {
          conditionalFieldsAddedRef.current.add(fieldId);
        });

        setTimeout(() => {
          fieldsAdded.forEach((fieldId) => {
            const currentValue = methods.getValues(fieldId);

            if (currentValue === undefined) {
              methods.setValue(fieldId, undefined, {
                shouldValidate: false,
                shouldDirty: false,
                shouldTouch: false,
              });
            }
          });
        }, 100);
      }

      previousSchemaFieldsRef.current = currentSchemaFields;

      if (fieldsAdded.length > 0) {
        setTimeout(() => {
          methods.trigger(fieldsAdded);
        }, 0);
      }

      setZodResolverDynamic(dynamicSchema);
    }
  }, [dynamicSchema, methods]);

  useEffect(() => {
    if (isSubmitting) {
      return;
    }

    const currentAllValuesKeys = new Set(Object.keys(allValues));
    const missingFields = Array.from(conditionalFieldsAddedRef.current).filter(
      (fieldId) => !currentAllValuesKeys.has(fieldId)
    );

    if (missingFields.length > 0) {
      missingFields.forEach((fieldId) => {
        const currentValue = methods.getValues(fieldId);
        if (
          currentValue !== undefined ||
          methods.formState.dirtyFields[fieldId]
        ) {
          methods.setValue(
            fieldId,
            currentValue !== undefined ? currentValue : undefined,
            {
              shouldValidate: false,
              shouldDirty: methods.formState.dirtyFields[fieldId] || false,
              shouldTouch: false,
            }
          );
        }
      });
    }

    const hasChanges = Object.keys(allValues).some(
      (fieldId) => previousValues.current[fieldId] !== allValues[fieldId]
    );

    if (hasChanges && Object.keys(allValues).length > 0) {
      onFormDataChange?.(allValues);

      let changedField: string | undefined;
      Object.keys(allValues).forEach((fieldId) => {
        if (previousValues.current[fieldId] !== allValues[fieldId]) {
          clearConditionCacheForField(fieldId);
          changedField = fieldId;
        }
      });

      if (changedField) {
        perfSampler.current.recordTypingEvent();
        setLastChangedField(changedField);
        Promise.resolve().then(() => setLastChangedField(undefined));
      }

      previousValues.current = { ...allValues };
    } else if (Object.keys(allValues).length === 0) {
      previousValues.current = {};
    }
  }, [allValues, onFormDataChange, isSubmitting, methods]);

  const handleFieldBlur = useCallback(
    (fieldId: string) => {
      setLastBlurredField(fieldId);
      methods.trigger(fieldId);
      setTimeout(() => setLastBlurredField(undefined), 100);
    },
    [methods]
  );

  useEffect(() => {
    if (methods.formState.isDirty) {
      onFormDirtyChange?.(true);
    }
  }, [methods.formState.isDirty, onFormDirtyChange]);

  const { handleSubmit, control } = methods;

  const getFieldStatusCallback = useCallback(
    (fieldId: string) => {
      return getFieldStatus(registerSelected as any, fieldId);
    },
    [registerSelected]
  );

  const handleNextStep = useCallback(async () => {
    if (!isMultiStep || isLastStep) return;
    const stepFieldIds = getStepFieldIds(currentStep);
    const isValid = await methods.trigger(stepFieldIds as any);
    if (!isValid) {
      const errors = methods.formState.errors;
      const errorFieldIds = Object.keys(errors).filter((id) =>
        stepFieldIds.includes(id)
      );
      if (errorFieldIds.length > 0) {
        const firstErr = findFirstErrorFieldId(visibleFields, errorFieldIds);
        if (firstErr) {
          await ensureScrollToError(firstErr, errorFieldIds);
        }
      }
      return;
    }
    setCurrentStep((s) => s + 1);
  }, [
    isMultiStep,
    isLastStep,
    currentStep,
    getStepFieldIds,
    methods,
    visibleFields,
    ensureScrollToError,
  ]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const onFormSubmit = async (_data: any) => {
    const formValues = methods.getValues();

    try {
      const uploads: FormUpload[] = [];
      const dados: Record<string, any> = {};
      const currentFormValues = { ...formValues, ...allValues };

      processFieldsForSubmission(fields, currentFormValues, uploads, dados);

      const hasUploads = uploads.length > 0;
      const hasFormData = Object.keys(dados).length > 0;

      if (!hasUploads && !hasFormData) {
        onValidationError?.([
          {
            fieldId: "",
            fieldLabel: "",
            fieldType: "",
            errorMessage: "No data was filled in the form.",
            errorType: "empty_form",
            isConditional: false,
          },
        ]);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(true);
      const submitStart = Date.now();
      await onSubmit({ dados, uploads });
      const submitMs = Date.now() - submitStart;
      perfSampler.current.report(submitMs);
      perfSampler.current.reset();
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      onSubmitError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleSubmitWithValidation = useCallback(async () => {
    Keyboard.dismiss();
    setIsValidating(true);

    try {
      const isValid = await methods.trigger();

      if (!isValid) {
        const errors = methods.formState.errors;
        const errorFields = collectErrorFieldsInfo(fields, errors);

        onValidationError?.(errorFields);

        setIsValidating(false);

        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));

        const errorFieldIds = Object.keys(errors);
        const firstErrorFieldId = findFirstErrorFieldId(fields, errorFieldIds);

        if (firstErrorFieldId) {
          if (isMultiStep) {
            const errorField = findFieldInGroups(
              fields,
              firstErrorFieldId
            );
            if (errorField) {
              const stepIndex = errorField.config.step ?? 0;
              if (stepIndex !== currentStep) {
                setCurrentStep(stepIndex);
                await new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 150)
                );
              }
            }
          }

          const scrollSuccess = await ensureScrollToError(
            firstErrorFieldId,
            errorFieldIds
          );

          if (!scrollSuccess) {
            setTimeout(async () => {
              await ensureScrollToError(firstErrorFieldId, errorFieldIds);
            }, 500);
          }
        }

        return;
      }

      setIsValidating(false);
      handleSubmit(onFormSubmit)();
    } catch (error) {
      console.error("Erro na validação:", error);
      setIsValidating(false);
      onSubmitError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [
    methods,
    handleSubmit,
    onFormSubmit,
    fields,
    ensureScrollToError,
    onValidationError,
    onSubmitError,
    isMultiStep,
    currentStep,
  ]);

  const registerFieldPosition = useCallback((fieldId: string, y: number) => {
    fieldPositionsRef.current.set(fieldId, y);
  }, []);

  const getParentYPosition = useCallback((fieldId: string) => {
    return fieldPositionsRef.current.get(fieldId);
  }, []);

  useEffect(() => {
    fieldPositionsRef.current.clear();
    if (isMultiStep && fieldListRef.current) {
      requestAnimationFrame(() => {
        fieldListRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    }
  }, [currentStep, isMultiStep]);

  const ctx = useMemo<DynamicFormContextValue>(
    () => ({
      fields,
      visibleFields,
      steps,
      formId,
      formName,
      scrollEnabled,
      isSubmitting,
      isValidating,
      setIsValidating,
      currentStep,
      setCurrentStep,
      isMultiStep,
      isFirstStep,
      isLastStep,
      methods,
      allValues,
      lastChangedField,
      lastBlurredField,
      fieldListRef,
      fieldPositionsRef,
      registerFieldPosition,
      getParentYPosition,
      handleFieldBlur,
      getFieldStatusCallback,
      handleNextStep,
      handleBackStep,
      handleSubmitWithValidation,
    }),
    [
      fields,
      visibleFields,
      steps,
      formId,
      formName,
      scrollEnabled,
      isSubmitting,
      isValidating,
      currentStep,
      isMultiStep,
      isFirstStep,
      isLastStep,
      methods,
      allValues,
      lastChangedField,
      lastBlurredField,
      fieldPositionsRef,
      registerFieldPosition,
      getParentYPosition,
      handleFieldBlur,
      getFieldStatusCallback,
      handleNextStep,
      handleBackStep,
      handleSubmitWithValidation,
    ]
  );

  return (
    <FormProvider {...methods}>
      <DynamicFormCompositionContext.Provider value={ctx}>
        <View style={rootStyles.formRoot}>{children}</View>
      </DynamicFormCompositionContext.Provider>
    </FormProvider>
  );
};

const rootStyles = StyleSheet.create({
  formRoot: { flex: 1, width: "100%" },
});

const listStyles = StyleSheet.create({
  fieldsContainer: { flex: 1, minHeight: 0, width: "100%" },
  fieldWrapper: { width: "100%", marginBottom: 24 },
  footerWrapper: { width: "100%", paddingHorizontal: 16 },
});

// --- Compound subcomponents (same order as web) -----------------------------

export const DynamicFormHeader: React.FC<{
  formNameOverride?: string;
}> = ({ formNameOverride }) => {
  const { formName } = useDynamicFormComposition();
  return <FormHeader formName={formNameOverride ?? formName} />;
};

export const DynamicFormSteps: React.FC<Record<string, never>> = () => {
  const { isMultiStep, steps, currentStep } = useDynamicFormComposition();
  if (!isMultiStep || !steps || steps.length < 2) {
    return null;
  }
  return <StepIndicator steps={steps} currentStep={currentStep} />;
};

export const DynamicFormFields: React.FC<{
  components?: ComponentOverridesMap;
  /** Outer wrapper (scroll region). */
  style?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  gap?: number;
}> = ({
  components,
  style,
  listStyle,
  contentContainerStyle,
  gap = 16,
}) => {
  const {
    visibleFields,
    scrollEnabled,
    methods,
    allValues,
    lastChangedField,
    lastBlurredField,
    handleFieldBlur,
    getFieldStatusCallback,
    fieldListRef,
    fieldPositionsRef,
    registerFieldPosition,
    getParentYPosition,
    currentStep,
  } = useDynamicFormComposition();
  const { control } = methods;

  const containerHeightsMap = useRef<Map<string, number>>(new Map());
  const layoutSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    containerHeightsMap.current.clear();
  }, [visibleFields, currentStep]);

  const renderField = useCallback(
    ({ item: field, index }: { item: DynamicFieldConfig; index: number }) => {
      const fieldStatus = getFieldStatusCallback(field.id);

      const handleContainerLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        containerHeightsMap.current.set(field.id, height);

        let accumulated = 0;
        for (let i = 0; i < index; i++) {
          const prevField = visibleFields[i];
          const prevHeight =
            containerHeightsMap.current.get(prevField.id) || 0;
          accumulated += prevHeight;
          if (i > 0) accumulated += gap;
        }

        registerFieldPosition(field.id, accumulated);
        layoutSetRef.current.add(field.id);

        if (field.type === "group") {
          registerFieldPosition(field.id, accumulated);
          layoutSetRef.current.add(field.id);
        }
      };

      return (
        <View style={listStyles.fieldWrapper} onLayout={handleContainerLayout}>
          <DynamicField
            field={field}
            control={control}
            formValues={allValues}
            formState={methods.formState}
            changedFieldId={lastChangedField}
            blurredFieldId={lastBlurredField}
            onFieldBlur={handleFieldBlur}
            fieldStatus={fieldStatus}
            getFieldStatus={getFieldStatusCallback}
            onFieldLayout={registerFieldPosition}
            parentY={0}
            getParentY={getParentYPosition}
            components={components}
          />
        </View>
      );
    },
    [
      control,
      allValues,
      methods.formState,
      lastChangedField,
      lastBlurredField,
      handleFieldBlur,
      getFieldStatusCallback,
      registerFieldPosition,
      getParentYPosition,
      visibleFields,
      components,
      gap,
    ]
  );

  return (
    <View style={[listStyles.fieldsContainer, style]}>
      <FlashList<DynamicFieldConfig>
        ref={fieldListRef as React.Ref<FlashList<DynamicFieldConfig>>}
        data={visibleFields}
        extraData={currentStep}
        keyExtractor={(item: DynamicFieldConfig) => item.id}
        renderItem={renderField}
        estimatedItemSize={120}
        drawDistance={600}
        style={[{ flex: 1, width: "100%" }, listStyle]}
        contentContainerStyle={{
          ...({ gap } as any),
          paddingBottom: 24,
          paddingHorizontal: 16,
          ...(contentContainerStyle as object),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
};

export const DynamicFormFooter: React.FC<{
  components?: ActionsButtonProps;
}> = ({ components }) => {
  const {
    isSubmitting,
    isMultiStep,
    isFirstStep,
    isLastStep,
    handleNextStep,
    handleBackStep,
    handleSubmitWithValidation,
  } = useDynamicFormComposition();
  return (
    <View style={listStyles.footerWrapper}>
      <FormFooter
        isSubmitting={isSubmitting}
        multiStep={isMultiStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={handleNextStep}
        onBack={handleBackStep}
        onSubmit={handleSubmitWithValidation}
        actionsButton={components}
      />
    </View>
  );
};

export const DynamicFormValidationOverlay: React.FC = () => {
  const { isValidating, setIsValidating } = useDynamicFormComposition();
  return (
    <ValidationModal
      visible={isValidating}
      onTimeout={() => setIsValidating(false)}
    />
  );
};

/** @deprecated Use `DynamicFormFields` instead. */
export const DynamicFormContents = DynamicFormFields;