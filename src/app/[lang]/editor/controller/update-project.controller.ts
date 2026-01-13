import { ApiEither } from "@/feature/common/data/api-task";
import updateProjectUseCase from "@/feature/core/project/domain/usecase/update-project.usecase";
import { UpdateProjectParams } from "@/feature/core/project/domain/params/update-project.param-schema";
import Project from "@/feature/core/project/domain/entity/project.entity";

/**
 * Controller for updating a project.
 * Called from Hono routes (not Server Actions).
 */
export default async function updateProjectController(
  params: UpdateProjectParams & { userId: string },
): Promise<ApiEither<Project>> {
  return updateProjectUseCase(params);
}
