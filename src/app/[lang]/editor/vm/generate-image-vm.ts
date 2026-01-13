"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { InferRequestType } from "hono";

// Type for generate image request
type RequestType = {
  prompt: string;
};

export type GenerateImageVm = {
  generate: (prompt: string) => Promise<string | null>;
  isPending: boolean;
  error?: string;
};

export default class GenerateImageVM {
  useVM(): GenerateImageVm {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const generate = async (prompt: string): Promise<string | null> => {
      setIsPending(true);
      setError(undefined);
      try {
        const response = await (client as any).api.ai["generate-image"].$post({
          json: { prompt } as RequestType,
        });

        if (!response.ok) {
          throw new Error("Failed to generate image");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate image",
        );
        return null;
      } finally {
        setIsPending(false);
      }
    };

    return {
      generate,
      isPending,
      error,
    };
  }
}
