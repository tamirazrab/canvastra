"use server";

import { isLeft } from "fp-ts/lib/Either";
import updateProjectController from "@/feature/core/editor/application/controller/update-project.controller";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";
import Project from "@/feature/core/project/domain/entity/project.entity";
import { UpdateProjectParams } from "@/feature/core/project/domain/params/update-project.param-schema";

export type ProjectActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to update a project.
 * Handles authentication and ApiEither response.
 */
export async function updateProjectAction(
  params: UpdateProjectParams & { id: string },
  lang: string = "en",
): Promise<ProjectActionResult<Project>> {
  try {
    const userId = await requireUserId(lang);
    const result = await updateProjectController({
      ...params,
      userId,
    });

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to update project",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

