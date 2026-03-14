"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const SelectRoot = SelectPrimitive.Root;

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("dyn:scroll-my-1 dyn:p-1", className)}
      {...props}
    />
  );
}

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("dyn:flex dyn:flex-1 dyn:text-left", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "dyn:flex dyn:w-full dyn:min-w-0 dyn:items-center dyn:justify-between dyn:gap-1.5 dyn:rounded-md dyn:border dyn:border-input dyn:bg-transparent dyn:py-2 dyn:pr-2 dyn:pl-3 dyn:text-sm dyn:whitespace-nowrap dyn:transition-colors dyn:outline-none dyn:select-none dyn:focus-visible:border-ring dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:cursor-not-allowed dyn:disabled:opacity-50 dyn:aria-invalid:border-destructive dyn:aria-invalid:ring-2 dyn:aria-invalid:ring-destructive/20 dyn:data-placeholder:text-muted-foreground dyn:data-[size=default]:h-10 dyn:data-[size=sm]:h-8 dyn:[&_svg]:pointer-events-none dyn:[&_svg]:shrink-0 dyn:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="dyn:pointer-events-none dyn:size-4 dyn:text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> & {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  alignItemWithTrigger?: boolean;
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="dyn:isolate dyn:z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "dyn:relative dyn:isolate dyn:z-50 dyn:max-h-[var(--available-height)] dyn:w-[var(--anchor-width)] dyn:min-w-[8rem] dyn:origin-[var(--transform-origin)] dyn:overflow-x-hidden dyn:overflow-y-auto dyn:rounded-md dyn:bg-popover dyn:text-popover-foreground dyn:shadow-md dyn:ring-1 dyn:ring-border dyn:duration-100 dyn:data-[side=bottom]:slide-in-from-top-2 dyn:data-[side=left]:slide-in-from-right-2 dyn:data-[side=right]:slide-in-from-left-2 dyn:data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("dyn:px-2 dyn:py-1.5 dyn:text-xs dyn:font-medium dyn:text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "dyn:relative dyn:flex dyn:w-full dyn:cursor-default dyn:items-center dyn:gap-2 dyn:rounded-sm dyn:py-1.5 dyn:pr-8 dyn:pl-2 dyn:text-sm dyn:outline-none dyn:select-none dyn:focus:bg-accent dyn:focus:text-accent-foreground dyn:data-disabled:pointer-events-none dyn:data-disabled:opacity-50 dyn:[&_svg]:pointer-events-none dyn:[&_svg]:shrink-0 dyn:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="dyn:flex dyn:flex-1 dyn:shrink-0 dyn:gap-2 dyn:whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="dyn:pointer-events-none dyn:absolute dyn:right-2 dyn:flex dyn:size-4 dyn:items-center dyn:justify-center">
            <CheckIcon className="size-4" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  id?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  success?: boolean;
}

export function Select({
  id,
  options,
  placeholder = "Select...",
  value,
  onChange,
  error,
  success,
}: SelectProps) {
  const currentValue = value ?? "";
  return (
    <SelectRoot
      value={currentValue}
      onValueChange={(v: string | null) => onChange?.(v ?? "")}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "w-full",
          error && "border-destructive aria-invalid:border-destructive",
          !error && success && "border-emerald-500"
        )}
        aria-invalid={error || undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

export {
  SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
