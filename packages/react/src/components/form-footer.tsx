import React from "react";

interface FormFooterProps {
  isSubmitting: boolean;
}

export const FormFooter: React.FC<FormFooterProps> = ({ isSubmitting }) => {
  return (
    <footer className="w-full pt-4 mt-2 border-t border-border">
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex h-11 md:h-12 w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none ${
          isSubmitting
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </footer>
  );
};

