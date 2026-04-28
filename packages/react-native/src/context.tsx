import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { View } from "react-native";
import type { DynamicFieldConfig, FormStep, FormUpload } from "@jvseen/dynamo-core";
import type { ErrorFieldInfo } from "@jvseen/dynamo-core";
import {
  DynamicFormProvider,
  DynamicFormHeader,
  DynamicFormSteps,
  DynamicFormFields,
  DynamicFormFooter,
  DynamicFormValidationOverlay,
} from "./components/dynamic-form.js";
import type { ComponentOverridesMap } from "./components/dynamic-field.js";
import type { ActionsButtonProps } from "./components/form-footer.js";

interface FormContextType {
  handleToggleScroll: (v: boolean) => void;
  formId: string;
  formName: string;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

/** Props for `DynamicFormProvider` (composition). Same shape as web; pass slot components as `children`. */
export type DynamicFormProviderProps = PropsWithChildren & {
  fields: DynamicFieldConfig[];
  formId: string;
  formName: string;
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
  scrollEnabled?: boolean;
};

/** Batteries-included form (same idea as web `DynamicFormDefault`). */
export type DynamicFormDefaultProps = PropsWithChildren & {
  fields: DynamicFieldConfig[];
  formId: string;
  formName: string;
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
  /** Same as web `footerComponents`. */
  footerComponents?: ActionsButtonProps;
  /** @deprecated Use `footerComponents` (web-style) or keep for backward compatibility. */
  actionsButton?: ActionsButtonProps;
  /** When true (default), renders the form header with the form name. Set to false to hide it. */
  showHeader?: boolean;
  steps?: FormStep[];
};

export const DynamicFormDefault = React.memo(
  ({
    fields,
    formId,
    formName,
    initialValues,
    registerSelected,
    onSubmit,
    onSubmitError,
    onValidationError,
    onFormDataChange,
    onFormDirtyChange,
    components,
    footerComponents,
    actionsButton,
    showHeader = true,
    steps,
  }: DynamicFormDefaultProps) => {
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const handleToggleScroll = (v: boolean) => {
      setScrollEnabled(v);
    };

    const contextValue = useMemo(
      () => ({
        handleToggleScroll,
        formId,
        formName,
      }),
      [formId, formName]
    );

    if (!fields || !Array.isArray(fields)) {
      console.error(
        "Form fields not found or invalid format:",
        fields
      );
      return null;
    }

    const footer = footerComponents ?? actionsButton;

    return (
      <FormContext.Provider value={contextValue}>
        <View style={{ flex: 1, width: "100%" }}>
          <DynamicFormProvider
            fields={fields}
            formId={formId}
            formName={formName}
            scrollEnabled={scrollEnabled}
            initialValues={initialValues}
            registerSelected={registerSelected}
            onSubmit={onSubmit}
            onSubmitError={onSubmitError}
            onValidationError={onValidationError}
            onFormDataChange={onFormDataChange}
            onFormDirtyChange={onFormDirtyChange}
            steps={steps}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {showHeader && <DynamicFormHeader />}
              <DynamicFormSteps />
              <DynamicFormFields
                style={{ flex: 1, minHeight: 0, width: "100%" }}
                components={components}
              />
              <DynamicFormFooter components={footer} />
            </View>
            <DynamicFormValidationOverlay />
          </DynamicFormProvider>
        </View>
      </FormContext.Provider>
    );
  }
);

export function useDynamicForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useDynamicForm must be used within DynamicFormDefault");
  }
  return context;
}

