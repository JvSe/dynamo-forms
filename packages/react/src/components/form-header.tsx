import React from "react";

interface FormHeaderProps {
  formName: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ formName }) => {
  return (
    <header className="dyn:w-full dyn:pb-4 dyn:mb-4 dyn:border-b dyn:border-border">
      <h1 className="dyn:text-2xl dyn:md:text-3xl dyn:font-bold dyn:tracking-tight dyn:text-foreground">
        {formName}
      </h1>
    </header>
  );
};

