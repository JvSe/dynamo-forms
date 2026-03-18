import React from "react";
import { cn } from "../lib/utils";

export type SubmitButtonProps = {
  isSubmitting: boolean;
  multiStep: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
};

export type BackButtonProps = {
  onBack: () => void;
  disabled: boolean;
};

export type ActionsButtonProps = {
  /** Custom component for the primary action (Submit or Next in multi-step). */
  submit?: React.ComponentType<SubmitButtonProps>;
  /** Custom component for the Back button (multi-step only). */
  back?: React.ComponentType<BackButtonProps>;
};

interface FormFooterProps {
  isSubmitting: boolean;
  multiStep?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  /** Custom components for submit and back buttons. Pass submit and/or back to override one or both. */
  actionsButton?: ActionsButtonProps;
  className?: string;
}

const defaultBackButtonClass =
  "dyn:inline-flex dyn:h-11 dyn:md:h-12 dyn:flex-1 dyn:items-center dyn:justify-center dyn:rounded-md dyn:text-sm dyn:font-medium dyn:transition-colors dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:opacity-70 dyn:disabled:pointer-events-none dyn:bg-secondary dyn:text-secondary-foreground dyn:hover:bg-secondary/80";

const defaultPrimaryButtonClass =
  "dyn:inline-flex dyn:h-11 dyn:md:h-12 dyn:flex-1 dyn:items-center dyn:justify-center dyn:rounded-md dyn:text-sm dyn:font-medium dyn:transition-colors dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:opacity-70 dyn:disabled:pointer-events-none dyn:bg-primary dyn:text-primary-foreground dyn:hover:bg-primary/90";

const defaultPrimaryButtonDisabledClass =
  "dyn:inline-flex dyn:h-11 dyn:md:h-12 dyn:flex-1 dyn:items-center dyn:justify-center dyn:rounded-md dyn:text-sm dyn:font-medium dyn:transition-colors dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:opacity-70 dyn:disabled:pointer-events-none dyn:bg-muted dyn:text-muted-foreground";

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  multiStep = false,
  isFirstStep = true,
  isLastStep = true,
  onNext,
  onBack,
  actionsButton,
  className,
}) => {
  const handleBack = onBack ?? (() => {});
  const handleNext = onNext ?? (() => {});

  const renderBack = () => {
    if (actionsButton?.back) {
      const Back = actionsButton.back;
      return <Back onBack={handleBack} disabled={isSubmitting} />;
    }
    return (
      <button
        type="button"
        onClick={handleBack}
        disabled={isSubmitting}
        className={defaultBackButtonClass}
      >
        Back
      </button>
    );
  };

  const renderSubmit = () => {
    if (actionsButton?.submit) {
      const Submit = actionsButton.submit;
      return (
        <Submit
          isSubmitting={isSubmitting}
          multiStep={multiStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }
    const widthClass = multiStep ? "dyn:flex-1" : "dyn:w-full";
    return (
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${widthClass} ${isSubmitting ? defaultPrimaryButtonDisabledClass : defaultPrimaryButtonClass}`}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    );
  };

  const renderNext = () => {
    if (actionsButton?.submit) {
      const Submit = actionsButton.submit;
      return (
        <Submit
          isSubmitting={isSubmitting}
          multiStep={multiStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
    }
    return (
      <button
        type="button"
        onClick={handleNext}
        disabled={isSubmitting}
        className={defaultPrimaryButtonClass}
      >
        Next
      </button>
    );
  };

  if (multiStep) {
    return (
      <footer
        className={cn(
          "dyn:w-full dyn:pt-4 dyn:mt-2 dyn:border-t dyn:border-border",
          className
        )}
      >
        <div className="dyn:flex dyn:gap-3">
          {!isFirstStep && renderBack()}
          {isLastStep ? renderSubmit() : renderNext()}
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        "dyn:w-full dyn:pt-4 dyn:mt-2 dyn:border-t dyn:border-border",
        className
      )}
    >
      {renderSubmit()}
    </footer>
  );
};

