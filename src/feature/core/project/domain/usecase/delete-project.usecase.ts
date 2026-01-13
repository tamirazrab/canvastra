import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { projectModuleKey } from "@/feature/core/project/data/project-module-key";
import ProjectRepository, {
  projectRepoKey,
} from "@/feature/core/project/domain/i-repo/project.repository.interface";

export default async function deleteProjectUseCase(
  id: string,
  userId: string,
): Promise<ApiEither<true>> {
  const repo = diResolve<ProjectRepository>(projectModuleKey, projectRepoKey);

  return repo.delete(id, userId)();
}
