import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIAVI FaceID Training",
  description: "Local FaceID and gesture training interface.",
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
