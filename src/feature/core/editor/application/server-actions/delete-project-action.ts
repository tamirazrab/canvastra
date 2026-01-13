"use server";

import { isLeft } from "fp-ts/lib/Either";
import deleteProjectController from "@/feature/core/editor/application/controller/delete-project.controller";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";

export type ProjectActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to delete a project.
 * Handles authentication and ApiEither response.
 */
export async function deleteProjectAction(
  projectId: string,
  lang: string = "en",
): Promise<ProjectActionResult<true>> {
  try {
    const userId = await requireUserId(lang);
    const result = await deleteProjectController(projectId, userId);

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to delete project",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}

