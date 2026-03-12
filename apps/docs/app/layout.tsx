import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
