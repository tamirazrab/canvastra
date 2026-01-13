"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { InferRequestType } from "hono";

// Type for remove background request
type RequestType = {
  image: string;
};

export type RemoveBgVm = {
  remove: (image: string) => Promise<string | null>;
  isPending: boolean;
  error?: string;
};

export default class RemoveBgVM {
  useVM(): RemoveBgVm {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const remove = async (image: string): Promise<string | null> => {
      setIsPending(true);
      setError(undefined);
      try {
        const response = await (client as any).api.ai["remove-bg"].$post({
          json: { image } as RequestType,
        });

        if (!response.ok) {
          throw new Error("Failed to remove background");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to remove background",
        );
        return null;
      } finally {
        setIsPending(false);
      }
    };

    return {
      remove,
      isPending,
      error,
    };
  }
}
