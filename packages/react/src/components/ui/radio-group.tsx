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
      className={cn("dyn:flex dyn:flex-col dyn:gap-2", className)}
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
        "dyn:flex dyn:items-center dyn:gap-2 dyn:rounded-md dyn:border dyn:border-border dyn:px-3 dyn:py-2 dyn:text-sm dyn:text-foreground dyn:cursor-pointer dyn:transition-colors",
        "dyn:bg-background dyn:hover:bg-muted",
        checked && "dyn:bg-primary/10 dyn:border-primary/50",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "dyn:flex dyn:h-4 dyn:w-4 dyn:items-center dyn:justify-center dyn:rounded-full dyn:border-2 dyn:border-border",
          checked && "dyn:border-primary dyn:bg-primary/10"
        )}
      >
        {checked && (
          <span className="dyn:h-2 dyn:w-2 dyn:rounded-full dyn:bg-primary" aria-hidden="true" />
        )}
      </span>
      <span>{children}</span>
    </button>
  );
};
RadioItem.displayName = "RadioItem";

export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioItem });

