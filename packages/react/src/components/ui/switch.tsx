import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "dyn:relative dyn:inline-flex dyn:h-6 dyn:w-11 dyn:items-center dyn:rounded-full dyn:border dyn:transition-colors",
          checked ? "dyn:bg-primary dyn:border-primary" : "dyn:bg-input dyn:border-input",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "dyn:inline-block dyn:h-4 dyn:w-4 dyn:transform dyn:rounded-full dyn:bg-background dyn:transition-transform",
            checked ? "dyn:translate-x-6" : "dyn:translate-x-1"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

