"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="dyn:p-2 dyn:rounded-lg dyn:text-muted-foreground dyn:hover:bg-accent dyn:hover:text-accent-foreground dyn:transition-colors dyn:w-9 dyn:h-9"
        aria-label="Alternar tema"
      >
        <span className="dyn:text-lg">☀️</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="dyn:p-2 dyn:rounded-lg dyn:text-muted-foreground dyn:hover:bg-accent dyn:hover:text-accent-foreground dyn:transition-colors dyn:w-9 dyn:h-9"
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {theme === "dark" ? (
        <span className="dyn:text-lg">☀️</span>
      ) : (
        <span className="dyn:text-lg">🌙</span>
      )}
    </button>
  );
}
