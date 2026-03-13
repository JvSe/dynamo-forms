import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { View } from "react-native";
import type { DynamicFieldConfig, FormUpload } from "@jvseen/dynamo-core";
import type { ErrorFieldInfo } from "@jvseen/dynamo-core";
import { DynamicFormCore } from "./components/dynamic-form.js";

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
        <View style={{ flex: 1, width: "100%" }}>
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
          />
        </View>
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

