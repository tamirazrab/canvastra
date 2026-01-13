"use server";

import { isLeft } from "fp-ts/lib/Either";
import getProjectsController from "@/feature/core/editor/application/controller/get-projects.controller";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type ProjectActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to get paginated projects.
 * Handles authentication and ApiEither response.
 */
export async function getProjectsAction(
  page: number = 1,
  limit: number = 5,
  lang: string = "en",
): Promise<ProjectActionResult<{ projects: Project[]; hasMore: boolean }>> {
  try {
    const userId = await requireUserId(lang);
    const skip = (page - 1) * limit;
    const result = await getProjectsController({ userId, limit, skip });

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to fetch projects",
      };
    }

    const hasMore = result.right.items.length === limit;
    return {
      success: true,
      data: { projects: result.right.items, hasMore },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

