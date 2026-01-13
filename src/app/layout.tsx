import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Canvas",
  description: "Build Something Great!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root layout just passes through - actual layout is in [lang]/layout.tsx
  return children;
}
