import React from "react";

interface FormFooterProps {
  isSubmitting: boolean;
  multiStep?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onNext?: () => void;
  onBack?: () => void;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isSubmitting,
  multiStep = false,
  isFirstStep = true,
  isLastStep = true,
  onNext,
  onBack,
}) => {
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

