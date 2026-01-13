"use client";

import { useState, useCallback } from "react";
import { generateImageAction } from "../server-actions/generate-image-action";

export type GenerateImageVm = {
  generate: (prompt: string) => Promise<string | null>;
  isPending: boolean;
  error?: string;
};

export default class GenerateImageVM {
  useVM(): GenerateImageVm {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const generate = useCallback(
      async (prompt: string): Promise<string | null> => {
        setIsPending(true);
        setError(undefined);
        try {
          const result = await generateImageAction(prompt);

          if (!result.success) {
            setError(result.error);
            return null;
          }

          return result.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to generate image";
          setError(errorMessage);
          return null;
        } finally {
          setIsPending(false);
        }
      },
      [],
    );

    return {
      generate,
      isPending,
      error,
    };
  }
}

