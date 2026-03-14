import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { FlatList, Keyboard, StyleSheet, View } from "react-native";
import {
  findFirstErrorFieldId,
  getFieldStatus,
  getInitialValuesFromRegister,
  processFieldsForSubmission,
  collectErrorFieldsInfo,
  type ErrorFieldInfo,
  type DynamicFieldConfig,
  type FormUpload,
  buildZodSchema,
  clearConditionCacheForField,
} from "@jvseen/dynamo-core";
import { scrollToFirstError as scrollToFirstErrorUtil } from "../form-scroll.js";
import { DynamicField, type ComponentOverridesMap } from "./dynamic-field.js";
import type { SubmitButtonProps } from "./form-footer.js";
import { FormFooter } from "./form-footer.js";
import { FormHeader } from "./form-header.js";
import { ValidationModal } from "./validation-modal.js";

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
  /** Custom component to replace the default submit button. */
  SubmitButton?: React.ComponentType<SubmitButtonProps>;
}

const DynamicFormCore: React.FC<DynamicFormProps> = ({
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
  SubmitButton,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

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

  const flatListRef = useRef<FlatList<DynamicFieldConfig>>(null);
  const fieldPositionsRef = useRef<Map<string, number>>(new Map());
  const containerHeightsRef = useRef<Map<string, number>>(new Map());
  const headerHeightRef = useRef<number>(0);
  const layoutMeasuredRef = useRef<Set<string>>(new Set());

  const scrollToFirstError = useCallback(() => {
    return scrollToFirstErrorUtil(
      flatListRef,
      fieldPositionsRef,
      fields,
      methods.formState.errors
    );
  }, [methods.formState.errors, fields]);

  const ensureScrollToError = useCallback(
    async (
      firstErrorFieldId: string,
      errorFieldIds: string[]
    ): Promise<boolean> => {
      if (!flatListRef.current || !firstErrorFieldId) {
        return false;
      }

      let targetIndex: number | null = null;

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

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

            if (!flatListRef.current) {
              resolve(false);
              return;
            }

            try {
              flatListRef.current.scrollToIndex({
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

        if (fieldY !== undefined && flatListRef.current) {
          try {
            const scrollOffset = Math.max(0, fieldY - 100);
            flatListRef.current.scrollToOffset({
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
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
            }

            await new Promise((resolve) => setTimeout(resolve, 50));
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
        setLastChangedField(changedField);
        queueMicrotask(() => {
          setLastChangedField(undefined);
        });
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

        await new Promise((resolve) => setTimeout(resolve, 100));

        const errorFieldIds = Object.keys(errors);
        const firstErrorFieldId = findFirstErrorFieldId(fields, errorFieldIds);

        if (firstErrorFieldId) {
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
  ]);

  const registerFieldPosition = useCallback((fieldId: string, y: number) => {
    fieldPositionsRef.current.set(fieldId, y);
  }, []);

  const getParentYPosition = useCallback((fieldId: string) => {
    return fieldPositionsRef.current.get(fieldId);
  }, []);

  const renderField = useCallback(
    ({ item: field, index }: { item: DynamicFieldConfig; index: number }) => {
      const fieldStatus = getFieldStatusCallback(field.id);

      const handleContainerLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        containerHeightsRef.current.set(field.id, height);

        let accumulated = headerHeightRef.current;
        for (let i = 0; i < index; i++) {
          const prevField = fields[i];
          const prevHeight =
            containerHeightsRef.current.get(prevField.id) || 0;
          accumulated += prevHeight;
          if (i > 0) accumulated += 16;
        }

        registerFieldPosition(field.id, accumulated);
        layoutMeasuredRef.current.add(field.id);

        if (field.type === "group") {
          registerFieldPosition(field.id, accumulated);
          layoutMeasuredRef.current.add(field.id);
        }
      };

      return (
        <View style={styles.fieldWrapper} onLayout={handleContainerLayout}>
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
      fields,
      components,
    ]
  );

  const renderHeader = useCallback(() => {
    return (
      <FormHeader
        formName={formName}
        onLayout={(height) => {
          headerHeightRef.current = height;
        }}
      />
    );
  }, [formName]);

  const renderFooter = useCallback(() => {
    return (
      <FormFooter
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitWithValidation}
        SubmitButton={SubmitButton}
      />
    );
  }, [isSubmitting, handleSubmitWithValidation, SubmitButton]);

  return (
    <FormProvider {...methods}>
      <FlatList
        ref={flatListRef}
        data={fields}
        keyExtractor={(item) => item.id}
        renderItem={renderField}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        style={styles.list}
        contentContainerStyle={{
          gap: 16,
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onTouchStart={Keyboard.dismiss}
        initialNumToRender={10}
        windowSize={10}
        maxToRenderPerBatch={10}
        getItemLayout={(_data, index) => {
          let height = headerHeightRef.current;

          for (let i = 0; i < index; i++) {
            const fieldId = fields[i]?.id;
            if (fieldId) {
              const fieldHeight =
                containerHeightsRef.current.get(fieldId) || 100;
              height += fieldHeight;
              if (i > 0) height += 16;
            }
          }

          const currentFieldId = fields[index]?.id;
          const currentHeight = currentFieldId
            ? containerHeightsRef.current.get(currentFieldId) || 100
            : 100;

          return {
            length: currentHeight,
            offset: height,
            index,
          };
        }}
        onScrollToIndexFailed={(info) => {
          const wait = Math.max(300, info.averageItemLength * 15);

          setTimeout(() => {
            if (flatListRef.current) {
              try {
                flatListRef.current.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.1,
                });
              } catch {
                const targetField = fields[info.index];
                if (targetField) {
                  const fieldY = fieldPositionsRef.current.get(targetField.id);
                  if (fieldY !== undefined) {
                    try {
                      flatListRef.current?.scrollToOffset({
                        offset: Math.max(0, fieldY - 100),
                        animated: true,
                      });
                    } catch {
                      console.warn("Failed to scroll to error field");
                    }
                  }
                }
              }
            }
          }, wait);
        }}
      />

      <ValidationModal
        visible={isValidating}
        onTimeout={() => setIsValidating(false)}
      />
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  list: { width: "100%", flex: 1 },
  fieldWrapper: { width: "100%", marginBottom: 24 },
});

export { DynamicFormCore };

