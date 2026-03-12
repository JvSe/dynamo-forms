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
        "z-50 bg-black/40",
        container ? "absolute inset-0" : "fixed inset-0",
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
        "z-50 top-0 bottom-0 w-[320px] max-w-full bg-white flex flex-col outline-none",
        container ? "absolute" : "fixed",
        side === "right"
          ? "right-0 border-l border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.08)]"
          : "left-0 border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.08)]",
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
