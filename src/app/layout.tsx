import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telegram AI Assistant",
  description: "A personal assistant powered by Next.js and Telegram.",
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