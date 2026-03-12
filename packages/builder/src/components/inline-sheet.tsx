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
        "z-50 top-0 bottom-0 w-[320px] max-w-full bg-white flex flex-col outline-none",
        "transition-transform duration-[250ms] ease-out",
        container ? "absolute" : "fixed",
        side === "right"
          ? "right-0 border-l border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.08)]"
          : "left-0 border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.08)]",
        side === "right"
          ? entered ? "translate-x-0" : "translate-x-full"
          : entered ? "translate-x-0" : "-translate-x-full",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
