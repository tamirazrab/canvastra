import ProjectRepositoryImpl from "@/feature/core/project/data/repository/project.repository";
import { projectRepoKey } from "@/feature/core/project/domain/i-repo/project.repository.interface";
import { DependencyContainer } from "tsyringe";

export default function projectModule(di: DependencyContainer) {
  di.register(projectRepoKey, ProjectRepositoryImpl);

  return di;
}
