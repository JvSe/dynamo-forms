import React, { useEffect } from "react";

interface ValidationOverlayProps {
  visible: boolean;
  onTimeout?: () => void;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({
  visible,
  onTimeout,
}) => {
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        onTimeout?.();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [visible, onTimeout]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-background px-6 py-5 md:px-10 md:py-8 shadow-lg flex flex-col items-center gap-3 md:gap-4">
        <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm md:text-base text-foreground">
          Checking fields...
        </p>
      </div>
    </div>
  );
};

