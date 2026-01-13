"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { InferRequestType } from "hono";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Type for update project request
type RequestType = {
  json: string;
  height: number;
  width: number;
};

export type UpdateProjectVm = {
  update: (params: RequestType & { id: string }) => Promise<void>;
  isPending: boolean;
  isError: boolean;
};

export default class UpdateProjectVM {
  useVM(): UpdateProjectVm {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);

    const update = async (params: RequestType & { id: string }) => {
      setIsPending(true);
      setIsError(false);
      try {
        const response = await (client as any).api.projects[":id"].$patch({
          json: params,
          param: { id: params.id },
        });

        if (!response.ok) {
          throw new Error("Failed to update project");
        }

        toast.success("Project updated.");
        router.refresh();
      } catch (err) {
        setIsError(true);
        toast.error("Failed to update project");
      } finally {
        setIsPending(false);
      }
    };

    return {
      update,
      isPending,
      isError,
    };
  }
}
