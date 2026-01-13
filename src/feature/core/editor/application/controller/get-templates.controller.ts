import { ApiEither } from "@/feature/common/data/api-task";
import getTemplatesUseCase from "@/feature/core/project/domain/usecase/get-templates.usecase";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Project from "@/feature/core/project/domain/entity/project.entity";

/**
 * Controller for getting paginated templates.
 * Called from Hono routes (not Server Actions).
 */
export default async function getTemplatesController(paginationParams: {
  limit?: number;
  skip?: number;
}): Promise<ApiEither<WithPagination<Project>>> {
  return getTemplatesUseCase(paginationParams);
}

