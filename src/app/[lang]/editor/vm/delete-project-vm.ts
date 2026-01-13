"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

// Type for delete project request params
type RequestType = {
  param: { id: string };
};

export type DeleteProjectVm = {
  delete: (id: string) => Promise<void>;
  isPending: boolean;
};

export default class DeleteProjectVM {
  useVM(): DeleteProjectVm {
    const router = useRouter();
    const params = useParams();
    const lang = (params.lang as string) || "en";
    const [isPending, setIsPending] = useState(false);

    const deleteProject = async (id: string) => {
      setIsPending(true);
      try {
        const response = await (client as any).api.projects[":id"].$delete({
          param: { id },
        });

        if (!response.ok) {
          throw new Error("Failed to delete project");
        }

        toast.success("Project deleted.");
        // router.push() already triggers a navigation and refresh
        router.push(`/${lang}/editor`);
      } catch (err) {
        toast.error("Failed to delete project");
      } finally {
        setIsPending(false);
      }
    };

    return {
      delete: deleteProject,
      isPending,
    };
  }
}
