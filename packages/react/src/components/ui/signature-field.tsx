import React, { TextareaHTMLAttributes } from "react";

export interface SignatureFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const SignatureField: React.FC<SignatureFieldProps> = ({
  id,
  value,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className="dyn:space-y-2">
      <p className="dyn:text-sm dyn:text-muted-foreground">
        Assinatura (digite ou cole a representação da assinatura).
      </p>
      <textarea
        {...props}
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`dyn:flex dyn:w-full dyn:min-h-[80px] dyn:rounded-md dyn:border dyn:border-input dyn:bg-background dyn:px-3 dyn:py-2 dyn:text-sm dyn:ring-offset-background dyn:placeholder:text-muted-foreground dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2 dyn:disabled:cursor-not-allowed dyn:disabled:opacity-50 ${
          className ?? ""
        }`}
      />
    </div>
  );
};

