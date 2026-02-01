import { ApiEither } from "@/feature/common/data/api-task";
import getTemplatesUseCase from "@/feature/core/template/domain/usecase/get-templates.usecase";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Template from "@/feature/core/template/domain/entity/template.entity";
import { unstable_cache } from "next/cache";

/**
 * Controller for getting paginated templates.
 * Called from Hono routes (not Server Actions).
 * Cached for 60s to reduce Neon SQL requests on repeated dashboard visits.
 */
export default async function getTemplatesController(paginationParams: {
  limit?: number;
  skip?: number;
}): Promise<ApiEither<WithPagination<Template>>> {
  const limit = paginationParams.limit ?? 5;
  const skip = paginationParams.skip ?? 0;

  return unstable_cache(
    async () => getTemplatesUseCase({ limit, skip })(),
    ["templates", String(limit), String(skip)],
    { revalidate: 60 },
  )();
}

