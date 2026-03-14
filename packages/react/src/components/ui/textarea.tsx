import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "dyn:flex dyn:w-full dyn:rounded-md dyn:border dyn:border-input dyn:bg-background dyn:px-3 dyn:py-2 dyn:text-sm dyn:ring-offset-background",
          "dyn:placeholder:text-muted-foreground dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2",
          "dyn:disabled:cursor-not-allowed dyn:disabled:opacity-50",
          error && "dyn:border-destructive",
          !error && success && "dyn:border-emerald-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

