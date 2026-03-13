import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  DynamicFieldConfig,
  FormStep,
  FormUpload,
  ErrorFieldInfo,
} from "@jvse/dynamo-core";
import { DynamicFormCore } from "./components/dynamic-form";
import type { ComponentOverridesMap } from "./components/dynamic-field";

interface FormContextType {
  handleToggleScroll: (v: boolean) => void;
  formId: string;
  formName: string;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

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
  components?: ComponentOverridesMap;
  steps?: FormStep[];
};

export const DynamicForm = React.memo(
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
    steps,
  }: DynamicFormProviderProps) => {
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

    return (
      <FormContext.Provider value={contextValue}>
        <div style={{ width: "100%" }}>
          <DynamicFormCore
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
            components={components}
            steps={steps}
          />
        </div>
      </FormContext.Provider>
    );
  }
);

export function useDynamicForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useDynamicForm must be used within DynamicForm");
  }
  return context;
}

