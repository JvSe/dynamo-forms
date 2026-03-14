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
    <div className="dyn:space-y-1 dyn:md:space-y-2">
      {titleText && (
        <h2 className="dyn:text-lg dyn:md:text-xl dyn:font-semibold dyn:tracking-tight dyn:text-foreground">
          {titleText}
        </h2>
      )}
      {description && (
        <p className="dyn:text-sm dyn:md:text-base dyn:text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

