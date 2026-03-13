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
    <div id={id} className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Select the desired captures.
      </p>
      <div className="flex flex-wrap gap-2">
        {capturas.map((captura) => {
          const selected = value.includes(captura.id);
          return (
            <button
              key={captura.id}
              type="button"
              onClick={() => handleToggle(captura.id)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:bg-muted"
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

