import React from "react";

interface FormHeaderProps {
  formName: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ formName }) => {
  return (
    <header className="w-full pb-4 mb-4 border-b border-border">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {formName}
      </h1>
      <p className="mt-1 text-sm md:text-base text-muted-foreground">
        Preencha os campos solicitados para continuar.
      </p>
    </header>
  );
};

