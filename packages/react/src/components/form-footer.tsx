import React from "react";

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
}

const defaultBackButtonClass =
  "inline-flex h-11 md:h-12 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none bg-secondary text-secondary-foreground hover:bg-secondary/80";

const defaultPrimaryButtonClass =
  "inline-flex h-11 md:h-12 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90";

const defaultPrimaryButtonDisabledClass =
  "inline-flex h-11 md:h-12 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none bg-muted text-muted-foreground";

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  multiStep = false,
  isFirstStep = true,
  isLastStep = true,
  onNext,
  onBack,
  actionsButton,
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
    const widthClass = multiStep ? "flex-1" : "w-full";
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
      <footer className="w-full pt-4 mt-2 border-t border-border">
        <div className="flex gap-3">
          {!isFirstStep && renderBack()}
          {isLastStep ? renderSubmit() : renderNext()}
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full pt-4 mt-2 border-t border-border">
      {renderSubmit()}
    </footer>
  );
};

