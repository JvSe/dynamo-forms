"use client";

import React from "react";
import { createPortal } from "react-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "../lib/utils.js";

const SheetContainerContext = React.createContext<HTMLElement | null>(null);

export function SheetRoot({
  open,
  containerRef,
  children,
}: {
  open: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const container = containerRef?.current ?? null;
  return (
    <SheetContainerContext.Provider value={container}>
      <Dialog.Root open={open}>
        {children}
      </Dialog.Root>
    </SheetContainerContext.Provider>
  );
}

export function SheetPortal({ children }: { children: React.ReactNode }) {
  const container = React.useContext(SheetContainerContext);
  if (container) {
    return createPortal(children, container);
  }
  return <Dialog.Portal>{children}</Dialog.Portal>;
}

export function SheetOverlay({
  className,
  style,
  ...props
}: React.ComponentProps<typeof Dialog.Overlay>) {
  const container = React.useContext(SheetContainerContext);
  return (
    <Dialog.Overlay
      className={cn(
        "dyn:z-50 dyn:bg-black/40",
        container ? "dyn:absolute dyn:inset-0" : "dyn:fixed dyn:inset-0",
        className
      )}
      style={style}
      {...props}
    />
  );
}

export function SheetContent({
  side = "right",
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content> & { side?: "right" }) {
  const container = React.useContext(SheetContainerContext);
  return (
    <Dialog.Content
      data-sheet-side={side}
      className={cn(
        "dyn:z-50 dyn:top-0 dyn:bottom-0 dyn:w-[320px] dyn:max-w-full dyn:bg-card dyn:flex dyn:flex-col dyn:outline-none",
        container ? "dyn:absolute" : "dyn:fixed",
        side === "right"
          ? "dyn:right-0 dyn:border-l dyn:border-border dyn:shadow-[-4px_0_24px_rgba(0,0,0,0.4)]"
          : "dyn:left-0 dyn:border-r dyn:border-border dyn:shadow-[4px_0_24px_rgba(0,0,0,0.4)]",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </Dialog.Content>
  );
}

export function SheetClose({
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close {...props}>{children}</Dialog.Close>;
}
