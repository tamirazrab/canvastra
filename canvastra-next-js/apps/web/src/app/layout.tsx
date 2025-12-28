import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { SubscriptionAlert } from "@/features/subscriptions/components/subscription-alert";

import { Modals } from "@/components/modals";
import Providers from "@/components/providers";

import "../index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Canvas",
  description: "Build Something Great!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Modals />
          <Suspense fallback={null}>
            <SubscriptionAlert />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
