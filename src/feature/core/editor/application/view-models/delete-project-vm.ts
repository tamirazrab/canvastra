"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { deleteProjectAction } from "../server-actions/delete-project-action";

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

    const deleteProject = useCallback(
      async (id: string) => {
        setIsPending(true);
        try {
          const result = await deleteProjectAction(id, lang);

          if (!result.success) {
            throw new Error(result.error);
          }

          toast.success("Project deleted.");
          router.push(`/${lang}/editor`);
        } catch (err) {
          toast.error("Failed to delete project");
        } finally {
          setIsPending(false);
        }
      },
      [router, lang],
    );

    return {
      delete: deleteProject,
      isPending,
    };
  }
}

