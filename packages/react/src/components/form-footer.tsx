import React from "react";

export type SubmitButtonProps = {
  isSubmitting: boolean;
  multiStep: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
};

interface FormFooterProps {
  isSubmitting: boolean;
  multiStep?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  /** Custom component to replace the default submit/back/next buttons. Must render button(s) with type="submit" for submit and type="button" with onClick for Back/Next. */
  SubmitButton?: React.ComponentType<SubmitButtonProps>;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  multiStep = false,
  isFirstStep = true,
  isLastStep = true,
  onNext,
  onBack,
  SubmitButton,
}) => {
  if (SubmitButton) {
    return (
      <footer className="w-full pt-4 mt-2 border-t border-border">
        <SubmitButton
          isSubmitting={isSubmitting}
          multiStep={multiStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={onNext ?? (() => {})}
          onBack={onBack ?? (() => {})}
        />
      </footer>
    );
  }

  if (multiStep) {
    return (
      <footer className="w-full pt-4 mt-2 border-t border-border">
        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex h-11 md:h-12 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Back
            </button>
          )}
          {isLastStep ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex h-11 md:h-12 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none ${
                isSubmitting
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={isSubmitting}
              className="inline-flex h-11 md:h-12 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
            </button>
          )}
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full pt-4 mt-2 border-t border-border">
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex h-11 md:h-12 w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none ${
          isSubmitting
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </footer>
  );
};

