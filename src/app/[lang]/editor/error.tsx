"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { logger } from "@/lib/logger";

/**
 * Error UI for editor page
 *
 * Shown when an error occurs in the editor route.
 * Provides retry functionality and navigation back.
 */
export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring
    logger.error("Editor page error", error, {
      digest: error.digest,
      route: "/editor",
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 shadow-lg dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-2 mb-4">
          <TriangleAlert className="size-6 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
            Something went wrong
          </h2>
        </div>
        <p className="mb-4 text-sm text-red-600 dark:text-red-300">
          {error.message ||
            "An unexpected error occurred while loading the editor"}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/editor">Back to Editor</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error.stack && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-red-600 dark:text-red-300">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
