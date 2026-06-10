import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportsAI Coach",
  description: "AI-supported sports training with secure face login and motion tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
