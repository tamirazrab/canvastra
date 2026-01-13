import WithPagination from "@/feature/common/class-helpers/with-pagination";
import ApiTask from "@/feature/common/data/api-task";
import Project from "@/feature/core/project/domain/entity/project.entity";
import { CreateProjectParams } from "@/feature/core/project/domain/params/create-project.param-schema";
import { UpdateProjectParams } from "@/feature/core/project/domain/params/update-project.param-schema";

export default interface ProjectRepository {
  getPaginatedList(paginationParams: {
    limit?: number;
    skip?: number;
    userId: string;
  }): ApiTask<WithPagination<Project>>;

  getById(id: string, userId: string): ApiTask<Project>;

  getTemplates(paginationParams: {
    limit?: number;
    skip?: number;
  }): ApiTask<WithPagination<Project>>;

  create(params: CreateProjectParams & { userId: string }): ApiTask<Project>;

  update(params: UpdateProjectParams & { userId: string }): ApiTask<Project>;

  delete(id: string, userId: string): ApiTask<true>;

  duplicate(id: string, userId: string): ApiTask<Project>;
}

export const projectRepoKey = "projectRepoKey";
