import React, { useEffect } from "react";
import { cn } from "../lib/utils";

interface ValidationOverlayProps {
  visible: boolean;
  onTimeout?: () => void;
  className?: string;
  cardClassName?: string;
  textClassName?: string;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({
  visible,
  onTimeout,
  className,
  cardClassName,
  textClassName,
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
    <div
      className={cn(
        "dyn:fixed dyn:inset-0 dyn:z-50 dyn:flex dyn:items-center dyn:justify-center dyn:bg-black/50",
        className
      )}
    >
      <div
        className={cn(
          "dyn:rounded-lg dyn:bg-background dyn:px-6 dyn:py-5 dyn:md:px-10 dyn:md:py-8 dyn:shadow-lg dyn:flex dyn:flex-col dyn:items-center dyn:gap-3 dyn:md:gap-4",
          cardClassName
        )}
      >
        <div className="dyn:h-6 dyn:w-6 dyn:md:h-8 dyn:md:w-8 dyn:animate-spin dyn:rounded-full dyn:border-2 dyn:border-primary dyn:border-t-transparent" />
        <p
          className={cn(
            "dyn:text-sm dyn:md:text-base dyn:text-foreground",
            textClassName
          )}
        >
          Checking fields...
        </p>
      </div>
    </div>
  );
};

