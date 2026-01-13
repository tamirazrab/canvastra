import { ApiEither } from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import getProjectsUseCase from "@/feature/core/project/domain/usecase/get-projects.usecase";
import Project from "@/feature/core/project/domain/entity/project.entity";

/**
 * Controller for getting paginated list of projects.
 * Called from Hono routes (not Server Actions).
 */
export default async function getProjectsController(paginationParams: {
  limit?: number;
  skip?: number;
  userId: string;
}): Promise<ApiEither<WithPagination<Project>>> {
  return getProjectsUseCase(paginationParams);
}
