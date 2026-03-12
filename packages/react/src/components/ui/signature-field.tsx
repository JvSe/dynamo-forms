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
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Assinatura (digite ou cole a representação da assinatura).
      </p>
      <textarea
        {...props}
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`flex w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          className ?? ""
        }`}
      />
    </div>
  );
};

