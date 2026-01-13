"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import ButtonVm from "@/app/components/button/button.i-vm";
import { BaseVM } from "reactvvm";

// Request type for creating a project
type RequestType = {
  name: string;
  json: string;
  width: number;
  height: number;
};

export type CreateProjectButtonVm = ButtonVm & {
  create: (params: RequestType) => Promise<void>;
};

export default class CreateProjectButtonVM extends BaseVM<CreateProjectButtonVm> {
  useVM(): CreateProjectButtonVm {
    const router = useRouter();
    const params = useParams();
    const lang = (params.lang as string) || "en";
    const [isPending, setIsPending] = useState(false);

    const create = async (params: RequestType) => {
      setIsPending(true);
      try {
        // Type assertion needed because client types aren't fully inferred in this context
        const response = await (
          client as {
            api: {
              projects: {
                $post: (args: { json: RequestType }) => Promise<Response>;
              };
            };
          }
        ).api.projects.$post({
          json: params,
        });

        // Check for authentication errors first
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          toast.error(
            errorData.error === "Unauthorized"
              ? "Your session has expired. Please sign in again."
              : "Authentication failed. Please sign in again.",
          );
          // Redirect to sign in page
          router.push(`/${lang}/sign-in`);
          return;
        }

        // Check for other HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `Failed to create project (${response.status})`;
          toast.error(errorMessage);
          return;
        }

        const data = await response.json();

        // Validate that the response has the required data
        if (!data?.data?.id) {
          toast.error("Invalid response from server. Please try again.");
          return;
        }

        toast.success("Project created.");

        // Navigate to the new project
        // router.push() already triggers a navigation and refresh, no need for router.refresh()
        router.push(`/${lang}/editor/${data.data.id}`);
      } catch (error) {
        // Handle network errors, timeouts, etc.
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create project. Please check your connection and try again.";
        toast.error(errorMessage);
      } finally {
        setIsPending(false);
      }
    };

    const handleCreate = async () => {
      await create({
        name: "New Project",
        json: JSON.stringify({ objects: [] }),
        width: 1920,
        height: 1080,
      });
    };

    return {
      props: {
        title: isPending ? "Creating..." : "Create Project",
        isDisable: isPending,
      },
      onClick: handleCreate,
      create,
    };
  }
}
