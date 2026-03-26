import type {
  DynamicFieldConfig,
  ErrorFieldInfo,
  FormStep,
  FormUpload,
} from "@jvseen/dynamo-core";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ComponentOverridesMap } from "./components/dynamic-field";
import {
  DynamicFormFields,
  DynamicFormFooter,
  DynamicFormHeader,
  DynamicFormProvider,
  DynamicFormSteps,
  DynamicFormValidationOverlay,
} from "./components/dynamic-form";
import type { ActionsButtonProps } from "./components/form-footer";

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
  /** Custom component overrides (opcional – omita se não precisar) */
  components?: ComponentOverridesMap;
  /** Custom submit / back for `DynamicFormFooter` (não use mais no root; passe aqui se usar `DynamicFormDefault`). */
  footerComponents?: ActionsButtonProps;
  /** Classes CSS do formulário (opcional) */
  formClassName?: string;
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
    formClassName,
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
        <div data-dynamo-root style={{ width: "100%", minHeight: "100%", display: "flex", flexDirection: "column" }}>
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
            formClassName={formClassName}
            steps={steps}
          >
            <DynamicFormHeader />
            <DynamicFormSteps />
            <DynamicFormFields components={components} />
            <DynamicFormFooter components={footerComponents} />
            <DynamicFormValidationOverlay />
          </DynamicFormProvider>
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

