import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "responsive";
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-orientation={orientation}
        className={cn(
          "grid gap-1.5",
          orientation === "horizontal" && "md:grid-cols-[1fr_auto] md:items-center md:gap-4",
          className
        )}
        {...props}
      />
    );
  }
);
Field.displayName = "Field";

export const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-foreground",
      className
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

export interface FieldErrorProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string | null;
}

export const FieldError = React.forwardRef<
  HTMLParagraphElement,
  FieldErrorProps
>(({ className, message, ...props }, ref) => {
  if (!message) return null;
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm font-medium text-destructive mt-1",
        className
      )}
      {...props}
    >
      {message}
    </p>
  );
});
FieldError.displayName = "FieldError";

