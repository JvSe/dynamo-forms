import React from "react";
import { cn } from "../lib/utils";

interface FormHeaderProps {
  formName: string;
  className?: string;
  titleClassName?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  formName,
  className,
  titleClassName,
}) => {
  return (
    <header
      className={cn(
        "dyn:w-full dyn:pb-4 dyn:mb-4 dyn:border-b dyn:border-border",
        className
      )}
    >
      <h1
        className={cn(
          "dyn:text-2xl dyn:md:text-3xl dyn:font-bold dyn:tracking-tight dyn:text-foreground",
          titleClassName
        )}
      >
        {formName}
      </h1>
    </header>
  );
};

