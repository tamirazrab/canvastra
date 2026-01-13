"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { duplicateProjectAction } from "../server-actions/duplicate-project-action";

export type DuplicateProjectVm = {
  duplicate: (id: string) => Promise<void>;
  isPending: boolean;
};

export default class DuplicateProjectVM {
  useVM(): DuplicateProjectVm {
    const router = useRouter();
    const params = useParams();
    const lang = (params.lang as string) || "en";
    const [isPending, setIsPending] = useState(false);

    const duplicateProject = useCallback(
      async (id: string) => {
        setIsPending(true);
        try {
          const result = await duplicateProjectAction(id, lang);

          if (!result.success) {
            throw new Error(result.error);
          }

          toast.success("Project duplicated.");
          router.push(`/${lang}/editor/${result.data.id}`);
        } catch {
          toast.error("Failed to duplicate project");
        } finally {
          setIsPending(false);
        }
      },
      [router, lang],
    );

    return {
      duplicate: duplicateProject,
      isPending,
    };
  }
}

