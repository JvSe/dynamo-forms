import React from "react";
import type { FormStep } from "@jvseen/dynamo-core";

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <nav aria-label="Form progress" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium text-center max-w-[80px] truncate ${
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 mx-2 mt-[-18px]">
                  <div
                    className={`h-0.5 w-full rounded-full transition-colors ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
