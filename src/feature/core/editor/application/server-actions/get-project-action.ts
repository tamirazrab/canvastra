"use server";

import { isLeft } from "fp-ts/lib/Either";
import getProjectController from "@/feature/core/editor/application/controller/get-project.controller";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type ProjectActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to get a project by ID.
 * Handles authentication and ApiEither response.
 */
export async function getProjectAction(
  projectId: string,
  lang: string = "en",
): Promise<ProjectActionResult<Project>> {
  try {
    const userId = await requireUserId(lang);
    const result = await getProjectController(projectId, userId);

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to fetch project",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch project",
    };
  }
}

