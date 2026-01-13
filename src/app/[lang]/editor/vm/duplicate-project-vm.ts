"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

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

    const duplicateProject = async (id: string) => {
      setIsPending(true);
      try {
        const response = await (client as any).api.projects[":id"].duplicate.$post({
          param: { id },
        });

        if (!response.ok) {
          throw new Error("Failed to duplicate project");
        }

        const data = await response.json();
        toast.success("Project duplicated.");
        // router.push() already triggers a navigation and refresh
        router.push(`/${lang}/editor/${data.data.id}`);
      } catch {
        toast.error("Failed to duplicate project");
      } finally {
        setIsPending(false);
      }
    };

    return {
      duplicate: duplicateProject,
      isPending,
    };
  }
}
