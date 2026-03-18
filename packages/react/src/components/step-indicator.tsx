import React, { useEffect, useRef } from "react";
import type { FormStep } from "@jvseen/dynamo-core";
import { cn } from "../lib/utils";

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const currentStepRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = currentStepRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentStep]);

  const stepGap = 30;

  return (
    <nav
      aria-label="Form progress"
      className={cn(
        "dyn:w-full dyn:overflow-x-auto dyn:overflow-y-visible dyn:py-3 dyn:px-1",
        className
      )}
    >
      <ol className="dyn:flex dyn:items-center dyn:min-w-max" style={{ gap: 0 }}>
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <li
                ref={isCurrent ? currentStepRef : undefined}
                className="dyn:flex dyn:flex-col dyn:items-center dyn:gap-1 dyn:shrink-0"
              >
                <div
                  className={`dyn:flex dyn:items-center dyn:justify-center dyn:w-8 dyn:h-8 dyn:rounded-full dyn:text-xs dyn:font-semibold dyn:transition-colors dyn:shrink-0 ${
                    isCompleted
                      ? "dyn:bg-primary dyn:text-primary-foreground"
                      : isCurrent
                        ? "dyn:bg-primary dyn:text-primary-foreground dyn:ring-2 dyn:ring-primary/30 dyn:ring-offset-2"
                        : "dyn:bg-muted dyn:text-muted-foreground"
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
                  className={`dyn:text-[11px] dyn:font-medium dyn:text-center dyn:max-w-[80px] dyn:truncate dyn:block ${
                    isCurrent
                      ? "dyn:text-foreground"
                      : isCompleted
                        ? "dyn:text-foreground/70"
                        : "dyn:text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </li>
              {!isLast && (
                <li
                  className="dyn:flex dyn:items-center dyn:shrink-0 dyn:mt-[-18px] dyn:self-stretch dyn:p-2"
                  style={{ width: stepGap + 16 }}
                  aria-hidden
                >
                  <div
                    className={`dyn:h-0.5 dyn:w-full dyn:rounded-full dyn:transition-colors ${
                      isCompleted ? "dyn:bg-primary" : "dyn:bg-muted"
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
