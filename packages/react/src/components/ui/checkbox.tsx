import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "dyn:h-4 dyn:w-4 dyn:rounded dyn:border dyn:border-input dyn:text-primary",
          "dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2",
          "dyn:disabled:cursor-not-allowed dyn:disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

