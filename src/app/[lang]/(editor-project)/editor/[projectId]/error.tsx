"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { logger } from "@/lib/logger";

/**
 * Error UI for editor project page
 *
 * Shown when an error occurs loading a project.
 * Provides retry functionality and navigation back.
 */
export default function EditorProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const lang = (params.lang as string) || "en";

  useEffect(() => {
    // Log error for monitoring
    logger.error("Editor project page error", error, {
      digest: error.digest,
      projectId: params.projectId,
      route: `/editor/${params.projectId}`,
    });
  }, [error, params.projectId]);

  return (
    <div className="h-full flex flex-col gap-y-5 items-center justify-center">
      <TriangleAlert className="size-8 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Failed to load project</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/${lang}/dashboard`}>Back to Dashboard</Link>
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && error.stack && (
        <details className="mt-4 max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
