import React, { memo, useEffect, useMemo } from "react";
import { Control, Controller, FormState } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import {
  useDebounce,
  useOptimizedConditions,
  registerFieldDependency,
  getOptionValue,
  type DynamicFieldConfig,
} from "@jvseen/dynamo-core";

import {
  InputCapturas,
  InputCheckbox,
  InputDateTime,
  InputDivider,
  InputGroup,
  InputNumber,
  InputRadio,
  InputSignature,
  InputSwitch,
  InputText,
  InputTextarea,
  InputTitle,
  InputUpload,
} from "./ui/index.js";
import { InputSelectNew } from "./ui/input-select.js";

export type ComponentOverrideProps = {
  id: string;
  field: DynamicFieldConfig;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error: boolean;
  errorMessage?: string;
  success: boolean;
  disabled?: boolean;
};

export type ComponentOverridesMap = Partial<
  Record<DynamicFieldConfig["type"], React.ComponentType<ComponentOverrideProps>>
>;

type DynamicFieldProps = {
  field: DynamicFieldConfig;
  control: Control<any>;
  formValues: Record<string, any>;
  formState: FormState<any>;
  changedFieldId?: string;
  blurredFieldId?: string;
  onFieldBlur?: (fieldId: string) => void;
  fieldStatus?: {
    status: "aprovado" | "reprovado";
    mensagem?: string | null;
  } | null;
  getFieldStatus?: (fieldId: string) =>
    | {
        status: "aprovado" | "reprovado";
        mensagem?: string | null;
      }
    | null
    | undefined;
  onFieldLayout?: (fieldId: string, y: number) => void;
  parentY?: number;
  getParentY?: (fieldId: string) => number | undefined;
  components?: ComponentOverridesMap;
};

const DynamicFieldComponent: React.FC<DynamicFieldProps> = ({
  field,
  control,
  formValues,
  formState,
  changedFieldId,
  blurredFieldId,
  onFieldBlur,
  fieldStatus,
  getFieldStatus,
  onFieldLayout,
  parentY = 0,
  getParentY,
  components,
}) => {
  const { type, config, id } = useMemo(() => field, [field]);

  const optionsWithValue = useMemo(() => {
    const opts = config.options ?? [];
    return opts.map((opt) => ({ label: opt.label, value: getOptionValue(opt) }));
  }, [config.options]);

  useEffect(() => {
    registerFieldDependency(id, config.conditions);
  }, [id, config.conditions]);

  const shouldRender = useOptimizedConditions({
    fieldId: id,
    condition: config.conditions,
    formValues,
    changedFieldId,
    blurredFieldId,
  });

  const shouldDebounce = ["text", "number", "textarea"].includes(type);
  const debouncedBlur = useDebounce((fieldId: string) => {
    onFieldBlur?.(fieldId);
  }, 300);

  const handleBlur = shouldDebounce
    ? debouncedBlur
    : (fieldId: string) => onFieldBlur?.(fieldId);

  const fieldRef = React.useRef<View>(null);
  const fieldYRef = React.useRef<number>(0);

  if (!shouldRender) return null;

  const isError = !!formState?.errors[id];
  const isSuccess = !!formState?.dirtyFields[id] && !isError;

  const shouldShowFieldStatus =
    fieldStatus && type !== "upload" && type !== "signature";

  const handleLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;

    if (parentY === 0 && type !== "group") {
      return;
    }

    let actualParentY = parentY;
    if (type === "group" && getParentY) {
      const containerY = getParentY(id);
      if (containerY !== undefined) {
        actualParentY = containerY;
      }
    }

    const absoluteY = actualParentY + y;
    fieldYRef.current = absoluteY;
    onFieldLayout?.(id, absoluteY);
  };

  return (
    <View style={styles.row} ref={fieldRef} onLayout={handleLayout}>
      {shouldShowFieldStatus && (
        <View
          style={[
            styles.statusBar,
            fieldStatus.status === "aprovado"
              ? styles.statusBarAprovado
              : styles.statusBarReprovado,
          ]}
        />
      )}
      <View style={styles.content}>
        {type !== "group" && !components?.[type] && (
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              {config.label}
              {config.required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}

        <Controller
          control={control}
          name={field.id}
          render={({ field: { onChange, onBlur: rhfOnBlur, value } }) => {
            const safeValue = value ?? "";
            const errorMessage = formState?.errors[id]?.message as string | undefined;

            const Override = components?.[type];
            if (Override) {
              return (
                <Override
                  id={id}
                  field={field}
                  value={safeValue}
                  onChange={onChange}
                  onBlur={() => {
                    rhfOnBlur();
                    handleBlur(id);
                  }}
                  error={isError}
                  errorMessage={errorMessage}
                  success={isSuccess}
                />
              );
            }

            switch (type) {
              case "text":
                return (
                  <InputText
                    placeholder={config.placeholder || ""}
                    onChangeText={onChange}
                    value={safeValue}
                    onBlur={() => handleBlur(id)}
                    controller={{
                      error: isError,
                      success: isSuccess,
                    }}
                  />
                );
              case "number":
                return (
                  <InputNumber
                    placeholder={config.placeholder || ""}
                    onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                    value={String(safeValue)}
                    onBlur={() => handleBlur(id)}
                    controller={{
                      error: isError,
                      success: isSuccess,
                    }}
                  />
                );
              case "boolean":
                return (
                  <InputSwitch
                    value={value || false}
                    onValueChange={(newValue) => {
                      onChange(newValue);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                  />
                );
              case "select":
                return (
                  <InputSelectNew
                    options={optionsWithValue}
                    placeholder={config.placeholder}
                    onChange={(newValue) => {
                      onChange(newValue);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                    value={safeValue}
                    error={isError}
                    success={isSuccess}
                  />
                );
              case "textarea":
                return (
                  <InputTextarea
                    placeholder={config.placeholder || ""}
                    onChangeText={onChange}
                    value={safeValue}
                    rows={config.rows || 3}
                    onBlur={() => handleBlur(id)}
                    controller={{
                      error: isError,
                      success: isSuccess,
                    }}
                  />
                );
              case "radio":
                return (
                  <InputRadio
                    options={optionsWithValue}
                    value={safeValue}
                    onChange={(newValue) => {
                      onChange(newValue);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                    error={isError}
                    success={isSuccess}
                  />
                );
              case "checkbox":
                return (
                  <InputCheckbox
                    options={optionsWithValue}
                    value={Array.isArray(safeValue) ? safeValue : []}
                    maxSelect={config.maxSelect || 0}
                    onChange={(newValue) => {
                      onChange(newValue);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                    error={isError}
                    success={isSuccess}
                  />
                );
              case "datetime":
                return (
                  <InputDateTime
                    value={safeValue ? new Date(safeValue) : undefined}
                    onChange={(newValue) => {
                      onChange(newValue);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                    dateType={config.dateType || "date"}
                    placeholder={config.placeholder}
                    error={isError}
                    success={isSuccess}
                  />
                );
              case "title":
                return (
                  <InputTitle
                    titleText={config.titleText}
                    description={config.description}
                  />
                );
              case "divider":
                return <InputDivider />;
              case "group": {
                const groupContainerY = getParentY ? getParentY(id) : undefined;
                const groupParentY =
                  groupContainerY !== undefined
                    ? groupContainerY
                    : fieldYRef.current;

                return (
                  <InputGroup label={config.label || undefined}>
                    {config.children?.map((childField) => (
                      <DynamicField
                        key={childField.id}
                        field={childField}
                        control={control}
                        formValues={formValues}
                        formState={formState}
                        changedFieldId={changedFieldId}
                        blurredFieldId={blurredFieldId}
                        onFieldBlur={onFieldBlur}
                        fieldStatus={
                          getFieldStatus ? getFieldStatus(childField.id) : null
                        }
                        getFieldStatus={getFieldStatus}
                        onFieldLayout={onFieldLayout}
                        parentY={groupParentY}
                        getParentY={getParentY}
                        components={components}
                      />
                    ))}
                  </InputGroup>
                );
              }
              case "signature":
                return (
                  <InputSignature
                    value={safeValue}
                    onChange={(value) => {
                      onChange(value);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                  />
                );
              case "upload":
                return (
                  <InputUpload
                    fieldId={id}
                    fieldLabel={config.label}
                    maxImages={config.maxFiles}
                    onPhotosSelected={(base64Images) => {
                      onChange(base64Images);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                    error={isError}
                    success={isSuccess}
                  />
                );
              case "mult_capturas":
                return (
                  <InputCapturas
                    capturas={config.capturas || []}
                    value={Array.isArray(safeValue) ? safeValue : []}
                    onChange={(newValue) => {
                      onChange(newValue);
                      setTimeout(() => onFieldBlur?.(id), 100);
                    }}
                  />
                );
              default:
                return <></>;
            }
          }}
        />
        {fieldStatus?.status === "reprovado" && fieldStatus.mensagem && (
          <View style={styles.errorNoteBox}>
            <Text style={styles.errorNoteText}>
              Note: {fieldStatus.mensagem}
            </Text>
          </View>
        )}
        {isError && (
          <Text style={styles.errorText}>
            {formState?.errors[id]?.message as string}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  statusBar: {
    width: 4,
    height: "100%",
    marginRight: 12,
    borderRadius: 6,
  },
  statusBarAprovado: { backgroundColor: "#22c55e" },
  statusBarReprovado: { backgroundColor: "#ef4444" },
  content: { flex: 1, width: "100%" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  required: { color: "#ef4444" },
  errorNoteBox: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    marginTop: 12,
    padding: 12,
  },
  errorNoteText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
});

export const DynamicField = memo(
  DynamicFieldComponent,
  (prevProps, nextProps) => {
    if (prevProps.field.id !== nextProps.field.id) return false;

    if (
      prevProps.formValues[prevProps.field.id] !==
      nextProps.formValues[nextProps.field.id]
    )
      return false;

    if (
      prevProps.formState.errors[prevProps.field.id] !==
      nextProps.formState.errors[nextProps.field.id]
    )
      return false;

    if (
      prevProps.formState.dirtyFields[prevProps.field.id] !==
      nextProps.formState.dirtyFields[nextProps.field.id]
    )
      return false;

    if (prevProps.changedFieldId !== nextProps.changedFieldId) return false;
    if (prevProps.blurredFieldId !== nextProps.blurredFieldId) return false;

    if (prevProps.formValues !== nextProps.formValues) return false;
    if (prevProps.components !== nextProps.components) return false;

    return true;
  }
);

