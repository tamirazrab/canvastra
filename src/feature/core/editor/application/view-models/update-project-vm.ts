"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateProjectAction } from "../server-actions/update-project-action";

export type UpdateProjectVm = {
  update: (params: {
    id: string;
    json: string;
    height: number;
    width: number;
  }) => Promise<void>;
  isPending: boolean;
  isError: boolean;
};

export default class UpdateProjectVM {
  useVM(): UpdateProjectVm {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);

    const update = useCallback(
      async (params: {
        id: string;
        json: string;
        height: number;
        width: number;
      }) => {
        setIsPending(true);
        setIsError(false);
        try {
          const result = await updateProjectAction(params);

          if (!result.success) {
            throw new Error(result.error);
          }

          toast.success("Project updated.");
          router.refresh();
        } catch (err) {
          setIsError(true);
          toast.error("Failed to update project");
        } finally {
          setIsPending(false);
        }
      },
      [router],
    );

    return {
      update,
      isPending,
      isError,
    };
  }
}

