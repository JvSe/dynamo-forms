import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const RadioGroupRoot = ({
  className,
  value,
  onValueChange,
  children,
  ...props
}: RadioGroupRootProps) => {
  return (
    <div
      role="radiogroup"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement(child) &&
          (child.type as any).displayName === "RadioItem"
        ) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onSelect: () => onValueChange?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};

interface RadioItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  checked?: boolean;
  onSelect?: () => void;
}

export const RadioItem = ({
  className,
  checked,
  onSelect,
  children,
  ...props
}: RadioItemProps) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
        "bg-background hover:bg-muted",
        checked && "bg-primary/5 border-primary",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border border-input",
          checked && "border-primary"
        )}
      >
        {checked && (
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        )}
      </span>
      <span>{children}</span>
    </button>
  );
};
RadioItem.displayName = "RadioItem";

export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioItem });

