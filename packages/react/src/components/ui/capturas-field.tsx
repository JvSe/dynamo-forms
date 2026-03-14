import React from "react";

export interface CapturaConfig {
  id: string;
  label: string;
}

export interface CapturasFieldProps {
  id?: string;
  capturas: CapturaConfig[];
  value: string[];
  onChange?: (value: string[]) => void;
}

export const CapturasField: React.FC<CapturasFieldProps> = ({
  id,
  capturas,
  value,
  onChange,
}) => {
  const handleToggle = (capturaId: string) => {
    const exists = value.includes(capturaId);
    const next = exists
      ? value.filter((v) => v !== capturaId)
      : [...value, capturaId];
    onChange?.(next);
  };

  return (
    <div id={id} className="dyn:space-y-2">
      <p className="dyn:text-sm dyn:text-muted-foreground">
        Select the desired captures.
      </p>
      <div className="dyn:flex dyn:flex-wrap dyn:gap-2">
        {capturas.map((captura) => {
          const selected = value.includes(captura.id);
          return (
            <button
              key={captura.id}
              type="button"
              onClick={() => handleToggle(captura.id)}
              className={`dyn:inline-flex dyn:items-center dyn:rounded-full dyn:border dyn:px-3 dyn:py-1 dyn:text-xs dyn:font-medium dyn:transition-colors ${
                selected
                  ? "dyn:bg-primary dyn:text-primary-foreground dyn:border-primary"
                  : "dyn:bg-background dyn:text-foreground dyn:border-input dyn:hover:bg-muted"
              }`}
            >
              {captura.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

