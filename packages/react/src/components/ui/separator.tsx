import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) => {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "dyn:bg-border",
        orientation === "horizontal" ? "dyn:my-1.5 dyn:h-px dyn:w-full" : "dyn:mx-1.5 dyn:h-full dyn:w-px",
        className
      )}
      {...props}
    />
  );
};

