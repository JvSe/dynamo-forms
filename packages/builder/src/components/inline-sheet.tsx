"use client";

import React from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils.js";

type InlineSheetContextValue = HTMLElement | null;

const InlineSheetContainerContext = React.createContext<InlineSheetContextValue>(null);

type InlineSheetRootProps = {
  open: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
};

export function InlineSheetRoot({ open, containerRef, children }: InlineSheetRootProps) {
  const container = containerRef?.current ?? null;
  if (!open) return null;
  return (
    <InlineSheetContainerContext.Provider value={container}>
      {children}
    </InlineSheetContainerContext.Provider>
  );
}

export function InlineSheetPortal({ children }: { children: React.ReactNode }) {
  const container = React.useContext(InlineSheetContainerContext);
  if (container) {
    return createPortal(children, container);
  }
  return <>{children}</>;
}

type InlineSheetContentProps = {
  side?: "right";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export function InlineSheetContent({ side = "right", className, style, children }: InlineSheetContentProps) {
  const container = React.useContext(InlineSheetContainerContext);
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "dyn:z-50 dyn:top-0 dyn:bottom-0 dyn:w-[320px] dyn:max-w-full dyn:bg-white dyn:flex dyn:flex-col dyn:outline-none",
        "dyn:transition-transform dyn:duration-[250ms] dyn:ease-out",
        container ? "dyn:absolute" : "dyn:fixed",
        side === "right"
          ? "dyn:right-0 dyn:border-l dyn:border-gray-200 dyn:shadow-[-4px_0_24px_rgba(0,0,0,0.08)]"
          : "dyn:left-0 dyn:border-r dyn:border-gray-200 dyn:shadow-[4px_0_24px_rgba(0,0,0,0.08)]",
        side === "right"
          ? entered ? "dyn:translate-x-0" : "dyn:translate-x-full"
          : entered ? "dyn:translate-x-0" : "dyn:-translate-x-full",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
