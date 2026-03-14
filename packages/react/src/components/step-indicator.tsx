import React, { useEffect, useRef } from "react";
import type { FormStep } from "@jvseen/dynamo-core";

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  const currentStepRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = currentStepRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentStep]);

  const stepGap = 30;

  return (
    <nav aria-label="Form progress" className="w-full overflow-x-auto overflow-y-visible py-3 px-1">
      <ol className="flex items-center min-w-max" style={{ gap: 0 }}>
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <li
                ref={isCurrent ? currentStepRef : undefined}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors shrink-0 ${
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
                  className={`text-[11px] font-medium text-center max-w-[80px] truncate block ${
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </li>
              {!isLast && (
                <li
                  className="flex items-center shrink-0 mt-[-18px] self-stretch p-2"
                  style={{ width: stepGap + 16 }}
                  aria-hidden
                >
                  <div
                    className={`h-0.5 w-full rounded-full transition-colors ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
