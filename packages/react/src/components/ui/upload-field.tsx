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
    "dyn:flex dyn:h-10 dyn:w-full dyn:rounded-md dyn:border dyn:bg-background dyn:px-3 dyn:py-2 dyn:text-sm dyn:ring-offset-background dyn:file:border-0 dyn:file:bg-primary dyn:file:text-primary-foreground dyn:file:px-3 dyn:file:py-1.5 dyn:file:text-sm dyn:file:font-medium dyn:placeholder:text-muted-foreground dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:cursor-not-allowed dyn:disabled:opacity-50";

  const borderClasses = error
    ? "dyn:border-destructive"
    : success
    ? "dyn:border-emerald-500"
    : "dyn:border-input";

  return (
    <div className="dyn:space-y-2">
      <label
        htmlFor={id ?? fieldId}
        className="dyn:text-sm dyn:font-medium dyn:text-muted-foreground"
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

