import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Dynamo Forms",
  description: "Documentação do Dynamo Forms - formulários dinâmicos para React e React Native",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="dyn:min-h-screen dyn:bg-background dyn:text-foreground">
        <ThemeProvider>
          <header className="dyn:sticky dyn:top-0 dyn:z-50 dyn:border-b dyn:border-border dyn:bg-background dyn:flex dyn:justify-between dyn:items-center dyn:px-6 dyn:py-3">
            <a href="/" className="dyn:text-lg dyn:font-semibold dyn:text-foreground dyn:no-underline hover:dyn:opacity-80">
              Dynamo Forms
            </a>
            <ThemeToggle />
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
