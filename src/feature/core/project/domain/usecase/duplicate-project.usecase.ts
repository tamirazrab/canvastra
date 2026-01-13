import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { projectModuleKey } from "@/feature/core/project/data/project-module-key";
import ProjectRepository, {
  projectRepoKey,
} from "@/feature/core/project/domain/i-repo/project.repository.interface";
import Project from "@/feature/core/project/domain/entity/project.entity";

export default async function duplicateProjectUseCase(
  id: string,
  userId: string,
): Promise<ApiEither<Project>> {
  const repo = diResolve<ProjectRepository>(projectModuleKey, projectRepoKey);

  return repo.duplicate(id, userId)();
}
