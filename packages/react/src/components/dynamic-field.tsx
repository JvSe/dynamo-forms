import React, { memo, useEffect, useMemo, useRef } from "react";
import { Control, Controller, FormState } from "react-hook-form";
import {
  useDebounce,
  useOptimizedConditions,
  registerFieldDependency,
  getOptionValue,
  type DynamicFieldConfig,
} from "@jvseen/dynamo-core";

import {
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  Switch,
  Separator,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
  DateTimeField,
  UploadField,
  CapturasField,
  SignatureField,
  Select,
} from "./ui";

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
  /** When true, always render the field (e.g. in builder canvas), ignoring conditional visibility */
  ignoreConditions?: boolean;
  /** When true, do not render the field label (e.g. when builder shows its own title row) */
  hideLabel?: boolean;
  /** Custom component overrides keyed by field type */
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
  ignoreConditions = false,
  hideLabel = false,
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

  const shouldRenderFromConditions = useOptimizedConditions({
    fieldId: id,
    condition: config.conditions,
    formValues,
    changedFieldId,
    blurredFieldId,
  });

  const shouldRender = ignoreConditions || shouldRenderFromConditions;

  const shouldDebounce = ["text", "number", "textarea"].includes(type);
  const debouncedBlur = useDebounce((fieldId: string) => {
    onFieldBlur?.(fieldId);
  }, 300);

  const handleBlur = shouldDebounce
    ? debouncedBlur
    : (fieldId: string) => onFieldBlur?.(fieldId);

  const fieldRef = useRef<HTMLDivElement | null>(null);

  if (!shouldRender) return null;

  const shouldShowFieldStatus =
    fieldStatus && type !== "upload" && type !== "signature";

  return (
    <div className="flex gap-2" ref={fieldRef}>
      {shouldShowFieldStatus && (
        <div
          className={`w-1 md:w-1.5 rounded-xl ${
            fieldStatus.status === "aprovado" ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
      )}
      <div className="flex-1 space-y-2">
        <Controller
          control={control}
          name={field.id}
          render={({ field: rhfField, fieldState }) => {
            const safeValue = rhfField.value ?? "";
            const isError = !!fieldState.error;
            const isSuccess = fieldState.isDirty && !fieldState.invalid;
            const errorMessage = fieldState.error?.message as
              | string
              | undefined;

            const renderControl = () => {
              const Override = components?.[type];
              if (Override) {
                return (
                  <Override
                    id={id}
                    field={field}
                    value={safeValue}
                    onChange={rhfField.onChange}
                    onBlur={() => {
                      rhfField.onBlur();
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
                    <Input
                      {...rhfField}
                      id={id}
                      placeholder={config.placeholder || ""}
                      onBlur={() => {
                        rhfField.onBlur();
                        handleBlur(id);
                      }}
                      aria-invalid={fieldState.invalid || undefined}
                      error={isError}
                      success={isSuccess}
                    />
                  );
                case "number":
                  return (
                    <Input
                      id={id}
                      placeholder={config.placeholder || ""}
                      inputMode="numeric"
                      value={String(safeValue)}
                      onChange={(e) =>
                        rhfField.onChange(e.target.value.replace(/\D/g, ""))
                      }
                      onBlur={() => {
                        rhfField.onBlur();
                        handleBlur(id);
                      }}
                      aria-invalid={fieldState.invalid || undefined}
                      error={isError}
                      success={isSuccess}
                    />
                  );
                case "boolean":
                  return (
                    <Switch
                      id={id}
                      checked={!!rhfField.value}
                      onCheckedChange={(checked) => {
                        rhfField.onChange(checked);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                      aria-invalid={fieldState.invalid || undefined}
                    />
                  );
                case "select":
                  return (
                    <Select
                      id={id}
                      options={optionsWithValue}
                      placeholder={config.placeholder}
                      value={safeValue}
                      onChange={(newValue) => {
                        rhfField.onChange(newValue);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                      error={isError}
                      success={isSuccess}
                    />
                  );
                case "textarea":
                  return (
                    <Textarea
                      id={id}
                      placeholder={config.placeholder || ""}
                      value={safeValue}
                      onChange={(e) => rhfField.onChange(e.target.value)}
                      rows={config.rows || 3}
                      onBlur={() => {
                        rhfField.onBlur();
                        handleBlur(id);
                      }}
                      aria-invalid={fieldState.invalid || undefined}
                      error={isError}
                      success={isSuccess}
                    />
                  );
                case "radio":
                  return (
                    <RadioGroup
                      className={
                        config.alignment === "horizontal"
                          ? "flex flex-row flex-wrap gap-2"
                          : "flex flex-col gap-2"
                      }
                      value={safeValue}
                      onValueChange={(newValue) => {
                        rhfField.onChange(newValue);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                      aria-label={id}
                    >
                      {optionsWithValue.map((option) => (
                        <RadioGroup.Item
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup>
                  );
                case "checkbox":
                  return (
                    <div
                      id={id}
                      className={
                        config.alignment === "horizontal"
                          ? "flex flex-row flex-wrap gap-2"
                          : "flex flex-col gap-2"
                      }
                    >
                      {optionsWithValue.map((option) => {
                        const current = Array.isArray(safeValue)
                          ? safeValue
                          : [];
                        const checked = current.includes(option.value);

                        const handleToggle = () => {
                          const exists = current.includes(option.value);
                          let next: string[];

                          if (exists) {
                            next = current.filter((v) => v !== option.value);
                          } else {
                            if (
                              config.maxSelect &&
                              config.maxSelect > 0 &&
                              current.length >= config.maxSelect
                            ) {
                              next = [...current.slice(1), option.value];
                            } else {
                              next = [...current, option.value];
                            }
                          }

                          rhfField.onChange(next);
                          setTimeout(() => onFieldBlur?.(id), 100);
                        };

                        return (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors bg-background hover:bg-muted"
                          >
                            <Checkbox
                              checked={checked}
                              onChange={handleToggle}
                              aria-invalid={fieldState.invalid || undefined}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                case "date":
                case "time":
                case "datetime":
                  return (
                    <DateTimeField
                      id={id}
                      value={safeValue ? new Date(safeValue) : undefined}
                      onChange={(newValue) => {
                        rhfField.onChange(newValue);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                      dateType={
                        (config.dateType as "date" | "time" | "datetime") ||
                        (type === "time" ? "time" : type === "date" ? "date" : "datetime")
                      }
                      placeholder={config.placeholder}
                      error={isError}
                      success={isSuccess}
                    />
                  );
                case "title":
                  return (
                    <FieldTitle
                      titleText={config.titleText}
                      description={config.description}
                    />
                  );
                case "divider":
                  return <Separator orientation="horizontal" />;
                case "group":
                  return (
                    <FieldGroup
                      label={config.label || undefined}
                      alignment={config.alignment}
                    >
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
                            getFieldStatus
                              ? getFieldStatus(childField.id)
                              : null
                          }
                          getFieldStatus={getFieldStatus}
                          components={components}
                        />
                      ))}
                    </FieldGroup>
                  );
                case "signature":
                  return (
                    <SignatureField
                      id={id}
                      value={safeValue}
                      onChange={(value) => {
                        rhfField.onChange(value);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                    />
                  );
                case "upload":
                  return (
                    <UploadField
                      id={id}
                      fieldId={id}
                      fieldLabel={config.label}
                      maxFiles={config.maxFiles}
                      onFilesSelected={(files) => {
                        rhfField.onChange(files);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                      error={isError}
                      success={isSuccess}
                    />
                  );
                case "mult_capturas":
                  return (
                    <CapturasField
                      id={id}
                      capturas={config.capturas || []}
                      value={Array.isArray(safeValue) ? safeValue : []}
                      onChange={(newValue) => {
                        rhfField.onChange(newValue);
                        setTimeout(() => onFieldBlur?.(id), 100);
                      }}
                    />
                  );
                default:
                  return <></>;
              }
            };

            if (type === "title" || type === "divider" || type === "group") {
              return renderControl() ?? <></>;
            }

            return (
              <Field
                data-invalid={fieldState.invalid || undefined}
                aria-invalid={fieldState.invalid || undefined}
              >
                {!hideLabel && !components?.[type] && (
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <FieldLabel htmlFor={id}>
                      {config.label}
                      {config.required && (
                        <span className="text-red-500" aria-hidden="true">
                          {" "}
                          *
                        </span>
                      )}
                    </FieldLabel>
                  </div>
                )}

                {renderControl()}

                {config.description && (
                  <FieldDescription>{config.description}</FieldDescription>
                )}

                <FieldError message={errorMessage ?? undefined} />
              </Field>
            );
          }}
        />
        {fieldStatus?.status === "reprovado" && fieldStatus.mensagem && (
          <div className="w-full rounded-lg bg-red-100 mt-2 md:mt-3 p-2 md:p-3">
            <p className="text-red-600 text-sm md:text-base font-semibold">
              Note: {fieldStatus.mensagem}
            </p>
          </div>
        )}
      </div>
    </div>
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
    if (prevProps.ignoreConditions !== nextProps.ignoreConditions) return false;
    if (prevProps.hideLabel !== nextProps.hideLabel) return false;
    if (prevProps.components !== nextProps.components) return false;

    return true;
  }
);

