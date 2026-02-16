import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solar Prix",
  description: "F1-inspired solar energy monitoring dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
