import { ApiEither } from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import { diResolve } from "@/feature/common/features.di";
import { templateModuleKey } from "@/feature/core/template/data/template-module-key";
import TemplateRepository, {
  templateRepoKey,
} from "@/feature/core/template/domain/i-repo/template.repository.interface";
import Template from "@/feature/core/template/domain/entity/template.entity";

export default async function getTemplatesUseCase(paginationParams: {
  limit?: number;
  skip?: number;
}): Promise<ApiEither<WithPagination<Template>>> {
  const repo = diResolve<TemplateRepository>(templateModuleKey, templateRepoKey);

  const limit = Math.max(1, paginationParams.limit ?? 5);
  const skip = Math.max(0, paginationParams.skip ?? 0);
  return repo.getPaginated({ limit, skip })();
}
