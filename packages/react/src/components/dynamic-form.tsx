import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FormProvider,
  useForm,
  useWatch,
  type FieldValues,
} from "react-hook-form";
import {
  buildZodSchema,
  clearConditionCacheForField,
  collectErrorFieldsInfo,
  findFirstErrorFieldId,
  getFieldStatus,
  getInitialValuesFromRegister,
  processFieldsForSubmission,
  type DynamicFieldConfig,
  type ErrorFieldInfo,
  type FormStep,
  type FormUpload,
} from "@jvseen/dynamo-core";
import { DynamicField, type ComponentOverridesMap } from "./dynamic-field";
import { FormHeader } from "./form-header";
import { FormFooter, type ActionsButtonProps } from "./form-footer";
import { StepIndicator } from "./step-indicator";
import { ValidationOverlay } from "./validation-overlay";

interface DynamicFormProps {
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
  components?: ComponentOverridesMap;
  /** Custom components for submit and back buttons. Pass submit and/or back to override one or both. */
  actionsButton?: ActionsButtonProps;
  steps?: FormStep[];
  /** When true (default), renders the step indicator when steps are provided. Set to false to hide it. */
  showSteps?: boolean;
  /** When true (default), renders the form header with the form name. Set to false to hide it. */
  showHeader?: boolean;
}

export const DynamicFormCore: React.FC<DynamicFormProps> = ({
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
  components,
  actionsButton,
  steps,
  showSteps = true,
  showHeader = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isMultiStep = !!(steps && steps.length > 1);
  const isFirstStep = currentStep === 0;
  const isLastStep = !isMultiStep || currentStep === (steps?.length ?? 1) - 1;

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

  const hasInitializedFromRegister = useRef(false);

  const fieldRefs = useRef<Map<string, HTMLDivElement | null>>(
    new Map<string, HTMLDivElement | null>()
  );

  const registerFieldRef = useCallback(
    (fieldId: string, element: HTMLDivElement | null) => {
      if (!element) return;
      fieldRefs.current.set(fieldId, element);
    },
    []
  );

  const ensureScrollToError = useCallback(
    async (firstErrorFieldId: string, errorFieldIds: string[]) => {
      if (!firstErrorFieldId) return false;

      const targetId =
        firstErrorFieldId ||
        findFirstErrorFieldId(fields, errorFieldIds) ||
        "";

      if (!targetId) return false;

      const element =
        fieldRefs.current.get(targetId) ||
        (document?.getElementById(targetId) as HTMLDivElement | null);

      if (!element) return false;

      try {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      } catch {
        try {
          const top =
            element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: "smooth" });
          return true;
        } catch {
          return false;
        }
      }
    },
    [fields]
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
        }, 100);
      }
    }

    if (!registerSelected) {
      hasInitializedFromRegister.current = false;
    }
  }, [registerSelected, fields, methods, onFormDataChange]);

  const allValues = useWatch({ control: methods.control });
  const previousValues = useRef<Record<string, any>>({});
  const [lastChangedField, setLastChangedField] = useState<string | undefined>();
  const [lastBlurredField, setLastBlurredField] = useState<string | undefined>();

  const dynamicSchema = useMemo(
    () => buildZodSchema(fields, allValues),
    [fields, allValues]
  );

  const previousSchemaFieldsRef = useRef<Set<string>>(new Set());

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

      previousSchemaFieldsRef.current = currentSchemaFields;
      setZodResolverDynamic(dynamicSchema);
    }
  }, [dynamicSchema, methods]);

  useEffect(() => {
    if (isSubmitting) {
      return;
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
        setLastChangedField(changedField);
        queueMicrotask(() => {
          setLastChangedField(undefined);
        });
      }

      previousValues.current = { ...allValues };
    } else if (Object.keys(allValues).length === 0) {
      previousValues.current = {};
    }
  }, [allValues, onFormDataChange, isSubmitting]);

  const handleFieldBlur = useCallback(
    (fieldId: string) => {
      setLastBlurredField(fieldId);
      methods.trigger(fieldId as keyof FieldValues);
      setTimeout(() => setLastBlurredField(undefined), 100);
    },
    [methods]
  );

  useEffect(() => {
    if (methods.formState.isDirty) {
      onFormDirtyChange?.(true);
    }
  }, [methods.formState.isDirty, onFormDirtyChange]);

  const { handleSubmit } = methods;

  const getFieldStatusCallback = useCallback(
    (fieldId: string) => {
      return getFieldStatus(registerSelected as any, fieldId);
    },
    [registerSelected]
  );

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
      await onSubmit({ dados, uploads });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      onSubmitError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

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
        const firstErrorFieldId = findFirstErrorFieldId(
          visibleFields,
          errorFieldIds
        );
        if (firstErrorFieldId) {
          await ensureScrollToError(firstErrorFieldId, errorFieldIds);
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

  const handleSubmitWithValidation = useCallback(async () => {
    setIsValidating(true);

    try {
      const isValid = await methods.trigger();

      if (!isValid) {
        const errors = methods.formState.errors;
        const errorFields = collectErrorFieldsInfo(fields, errors);

        onValidationError?.(errorFields);

        setIsValidating(false);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const errorFieldIds = Object.keys(errors);
        const firstErrorFieldId = findFirstErrorFieldId(fields, errorFieldIds);

        if (firstErrorFieldId) {
          if (isMultiStep) {
            const errorField = fields.find((f) => f.id === firstErrorFieldId);
            if (errorField) {
              setCurrentStep(errorField.config.step ?? 0);
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
      console.error("Validation error:", error);
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
    isMultiStep,
    ensureScrollToError,
    onValidationError,
    onSubmitError,
  ]);

  return (
    <FormProvider {...methods}>
      <form
        className="dyn:w-full dyn:flex dyn:flex-col dyn:gap-4 dyn:md:gap-6 dyn:min-h-0 dyn:flex-1"
        aria-labelledby={formId}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmitWithValidation();
        }}
        noValidate
      >
        {showHeader && <FormHeader formName={formName} />}

        {isMultiStep && steps && showSteps && (
          <StepIndicator steps={steps} currentStep={currentStep} />
        )}

        <div
          className={`dyn:w-full dyn:flex dyn:flex-col dyn:flex-1 dyn:min-h-0 ${
            scrollEnabled ? "dyn:overflow-y-auto" : "dyn:overflow-hidden"
          }`}
          style={{ gap: 15 }}
        >
          {visibleFields.map((field) => (
            <div
              key={field.id}
              ref={(el) => registerFieldRef(field.id, el)}
              id={field.id}
            >
              <DynamicField
                field={field}
                control={methods.control}
                formValues={allValues}
                formState={methods.formState}
                changedFieldId={lastChangedField}
                blurredFieldId={lastBlurredField}
                onFieldBlur={handleFieldBlur}
                fieldStatus={getFieldStatusCallback(field.id)}
                getFieldStatus={getFieldStatusCallback}
                components={components}
              />
            </div>
          ))}
        </div>

        <div className="dyn:mt-auto dyn:shrink-0">
          <FormFooter
            isSubmitting={isSubmitting}
          multiStep={isMultiStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNextStep}
          onBack={handleBackStep}
          actionsButton={actionsButton}
          />
        </div>

        <ValidationOverlay
          visible={isValidating}
          onTimeout={() => setIsValidating(false)}
        />
      </form>
    </FormProvider>
  );
};

