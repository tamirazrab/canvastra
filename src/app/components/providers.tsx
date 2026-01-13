"use client";

import { QueryProvider } from "@/app/components/query-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
