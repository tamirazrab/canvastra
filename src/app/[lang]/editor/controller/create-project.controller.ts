import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { projectModuleKey } from "@/feature/core/project/data/project-module-key";
import createProjectUseCase from "@/feature/core/project/domain/usecase/create-project.usecase";
import { CreateProjectParams } from "@/feature/core/project/domain/params/create-project.param-schema";
import Project from "@/feature/core/project/domain/entity/project.entity";

/**
 * Controller for creating a project.
 * Called from Hono routes (not Server Actions).
 */
export default async function createProjectController(
  params: CreateProjectParams & { userId: string },
): Promise<ApiEither<Project>> {
  return createProjectUseCase(params);
}
