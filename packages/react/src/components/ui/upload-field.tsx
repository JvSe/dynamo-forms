import React, { ChangeEvent } from "react";

export interface UploadFieldProps {
  id?: string;
  fieldId: string;
  fieldLabel: string;
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  error?: boolean;
  success?: boolean;
}

export const UploadField: React.FC<UploadFieldProps> = ({
  id,
  fieldId,
  fieldLabel,
  maxFiles,
  onFilesSelected,
  error,
  success,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const limitedFiles =
      typeof maxFiles === "number" && maxFiles > 0
        ? files.slice(0, maxFiles)
        : files;
    onFilesSelected?.(limitedFiles);
  };

  const baseClasses =
    "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const borderClasses = error
    ? "border-destructive"
    : success
    ? "border-emerald-500"
    : "border-input";

  return (
    <div className="space-y-2">
      <label
        htmlFor={id ?? fieldId}
        className="text-sm font-medium text-muted-foreground"
      >
        {fieldLabel}
      </label>
      <input
        id={id ?? fieldId}
        type="file"
        multiple={maxFiles === undefined || maxFiles > 1}
        onChange={handleChange}
        className={`${baseClasses} ${borderClasses}`}
      />
    </div>
  );
};

