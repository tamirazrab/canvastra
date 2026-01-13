"use server";

import { isLeft } from "fp-ts/lib/Either";
import duplicateProjectController from "@/feature/core/editor/application/controller/duplicate-project.controller";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type ProjectActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to duplicate a project.
 * Handles authentication and ApiEither response.
 */
export async function duplicateProjectAction(
  projectId: string,
  lang: string = "en",
): Promise<ProjectActionResult<Project>> {
  try {
    const userId = await requireUserId(lang);
    const result = await duplicateProjectController(projectId, userId);

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to duplicate project",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to duplicate project",
    };
  }
}

