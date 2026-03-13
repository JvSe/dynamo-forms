import React, { memo, useEffect, useMemo } from "react";
import { Control, Controller, FormState } from "react-hook-form";
import { Text, View } from "react-native";
import {
  useDebounce,
  useOptimizedConditions,
  registerFieldDependency,
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
}) => {
  const { type, config, id } = useMemo(() => field, [field]);

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
    <View className="flex-row" ref={fieldRef} onLayout={handleLayout}>
      {shouldShowFieldStatus && (
        <View
          className={`w-1 md:w-1.5 h-full mr-2 md:mr-3 rounded-xl ${
            fieldStatus.status === "aprovado" ? "bg-green-500" : "bg-red-500"
          }`}
        />
      )}
      <View className="w-full flex-1">
        {type !== "group" && (
          <View className="flex-row items-center justify-between mb-1 md:mb-2">
            <Text className="text-base md:text-xl text-gray-800 font-semibold">
              {config.label}
              {config.required && <Text className="text-red-500"> *</Text>}
            </Text>
          </View>
        )}

        <Controller
          control={control}
          name={field.id}
          render={({ field: { onChange, value } }) => {
            const safeValue = value ?? "";
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
                    options={config.options || []}
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
                    options={config.options || []}
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
                    options={config.options || []}
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
          <View className="w-full rounded-lg bg-red-100 mt-2 md:mt-3 p-2 md:p-3">
            <Text className="text-red-500 text-sm md:text-base font-semibold">
              Note: {fieldStatus.mensagem}
            </Text>
          </View>
        )}
        {isError && (
          <Text className="text-red-500 text-sm md:text-base mt-2 md:mt-3 font-semibold">
            {formState?.errors[id]?.message as string}
          </Text>
        )}
      </View>
    </View>
  );
};

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

    return true;
  }
);

