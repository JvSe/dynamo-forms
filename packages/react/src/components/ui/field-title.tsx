import React from "react";

export interface FieldTitleProps {
  titleText?: string;
  description?: string;
}

export const FieldTitle: React.FC<FieldTitleProps> = ({
  titleText,
  description,
}) => {
  if (!titleText && !description) return null;

  return (
    <div className="space-y-1 md:space-y-2">
      {titleText && (
        <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
          {titleText}
        </h2>
      )}
      {description && (
        <p className="text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

