import { ApiEither } from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import getTemplatesUseCase from "@/feature/core/template/domain/usecase/get-templates.usecase";
import Template from "@/feature/core/template/domain/entity/template.entity";

/**
 * Controller for getting templates.
 * Called from Hono routes (not Server Actions).
 */
export default async function getTemplatesController(paginationParams: {
  limit?: number;
  skip?: number;
}): Promise<ApiEither<WithPagination<Template>>> {
  return getTemplatesUseCase(paginationParams);
}
