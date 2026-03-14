"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

const Popover = PopoverPrimitive.Root;

function PopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      className={cn(
        "dyn:inline-flex dyn:items-center dyn:justify-center dyn:rounded-md dyn:text-sm dyn:font-medium dyn:transition-colors dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:pointer-events-none dyn:disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="dyn:z-50"
      >
        <PopoverPrimitive.Popup
          className={cn(
            "dyn:z-50 dyn:w-72 dyn:rounded-md dyn:border dyn:bg-popover dyn:p-4 dyn:text-popover-foreground dyn:shadow-md dyn:outline-none dyn:data-[state=open]:animate-in dyn:data-[state=closed]:animate-out dyn:data-[state=closed]:fade-out-0 dyn:data-[state=open]:fade-in-0 dyn:data-[state=closed]:zoom-out-95 dyn:data-[state=open]:zoom-in-95 dyn:data-[side=bottom]:slide-in-from-top-2 dyn:data-[side=left]:slide-in-from-right-2 dyn:data-[side=right]:slide-in-from-left-2 dyn:data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
