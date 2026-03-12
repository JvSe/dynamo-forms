import React, { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export interface FieldGroupProps extends PropsWithChildren {
  label?: string;
  /** When "horizontal", children layout in a row (wrapped); default vertical stack */
  alignment?: "horizontal" | "vertical";
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ label, children, alignment }) => {
  const isHorizontal = alignment === "horizontal";
  return (
    <fieldset
      className={cn(
        "w-full rounded-lg border bg-card p-4 md:p-5",
        !isHorizontal && "space-y-3 md:space-y-4"
      )}
    >
      {label && (
        <legend className="px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </legend>
      )}
      <div
        className={cn(
          isHorizontal ? "flex flex-row flex-wrap gap-3 md:gap-4" : "space-y-3 md:space-y-4"
        )}
      >
        {children}
      </div>
    </fieldset>
  );
};

