import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Farbe AI Agent",
  description: "Brand color matching and design consistency review for event and marketing work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
