import WithPagination from "@/feature/common/class-helpers/with-pagination";
import ApiTask from "@/feature/common/data/api-task";
import Template from "@/feature/core/template/domain/entity/template.entity";

export default interface TemplateRepository {
  getPaginated(paginationParams: {
    limit?: number;
    skip?: number;
  }): ApiTask<WithPagination<Template>>;
}

export const templateRepoKey = "templateRepoKey";
