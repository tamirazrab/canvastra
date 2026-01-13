"use client";

import { ErrorBoundary } from "./error-boundary";

/**
 * Client-side wrapper for ErrorBoundary
 *
 * Error boundaries must be client components in Next.js App Router.
 * This wrapper allows us to use ErrorBoundary in server component layouts.
 */
export function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
