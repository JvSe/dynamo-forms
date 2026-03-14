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
    <div className="dyn:fixed dyn:inset-0 dyn:z-50 dyn:flex dyn:items-center dyn:justify-center dyn:bg-black/50">
      <div className="dyn:rounded-lg dyn:bg-background dyn:px-6 dyn:py-5 dyn:md:px-10 dyn:md:py-8 dyn:shadow-lg dyn:flex dyn:flex-col dyn:items-center dyn:gap-3 dyn:md:gap-4">
        <div className="dyn:h-6 dyn:w-6 dyn:md:h-8 dyn:md:w-8 dyn:animate-spin dyn:rounded-full dyn:border-2 dyn:border-primary dyn:border-t-transparent" />
        <p className="dyn:text-sm dyn:md:text-base dyn:text-foreground">
          Checking fields...
        </p>
      </div>
    </div>
  );
};

