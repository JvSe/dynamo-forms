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
        "dyn:w-full dyn:rounded-lg dyn:border dyn:bg-card dyn:p-4 dyn:md:p-5",
        !isHorizontal && "dyn:space-y-4 dyn:md:space-y-5"
      )}
    >
      {label && (
        <legend className="dyn:px-1 dyn:text-xs dyn:font-medium dyn:text-muted-foreground dyn:uppercase dyn:tracking-wide">
          {label}
        </legend>
      )}
      <div
        className={cn(
          isHorizontal ? "dyn:flex dyn:flex-row dyn:flex-wrap dyn:gap-4 dyn:md:gap-5" : "dyn:space-y-4 dyn:md:space-y-5"
        )}
      >
        {children}
      </div>
    </fieldset>
  );
};

