"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCProvider } from "@/lib/trpc-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCProvider>
        {children}
        <ReactQueryDevtools />
      </TRPCProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
