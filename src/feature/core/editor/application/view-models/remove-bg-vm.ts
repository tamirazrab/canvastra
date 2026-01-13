"use client";

import { useState, useCallback } from "react";
import { removeBackgroundAction } from "../server-actions/remove-background-action";

export type RemoveBgVm = {
  remove: (image: string) => Promise<string | null>;
  isPending: boolean;
  error?: string;
};

export default class RemoveBgVM {
  useVM(): RemoveBgVm {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const remove = useCallback(
      async (image: string): Promise<string | null> => {
        setIsPending(true);
        setError(undefined);
        try {
          const result = await removeBackgroundAction(image);

          if (!result.success) {
            setError(result.error);
            return null;
          }

          return result.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to remove background";
          setError(errorMessage);
          return null;
        } finally {
          setIsPending(false);
        }
      },
      [],
    );

    return {
      remove,
      isPending,
      error,
    };
  }
}

