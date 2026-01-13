"use server";

import { isLeft } from "fp-ts/lib/Either";
import getTemplatesController from "@/feature/core/editor/application/controller/get-templates.controller";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type ProjectActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to get paginated templates.
 * Handles ApiEither response.
 */
export async function getTemplatesAction(
  page: number = 1,
  limit: number = 5,
): Promise<ProjectActionResult<{ templates: Project[]; hasMore: boolean }>> {
  try {
    const skip = (page - 1) * limit;
    const result = await getTemplatesController({ limit, skip });

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to fetch templates",
      };
    }

    const hasMore = result.right.items.length === limit;
    return {
      success: true,
      data: { templates: result.right.items, hasMore },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch templates",
    };
  }
}

