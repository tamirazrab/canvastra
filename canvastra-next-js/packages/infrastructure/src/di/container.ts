import { DrizzleProjectRepository } from "../repositories/drizzle-project.repository";
import { CreateProjectUseCase } from "@canvastra-next-js/core/application/use-cases";
import { GetProjectsUseCase } from "@canvastra-next-js/core/application/use-cases";
import { UpdateProjectUseCase } from "@canvastra-next-js/core/application/use-cases";
import { DeleteProjectUseCase } from "@canvastra-next-js/core/application/use-cases";

// Repository instances
const projectRepository = new DrizzleProjectRepository();

// Use case instances
export const createProjectUseCase = new CreateProjectUseCase(projectRepository);
export const getProjectsUseCase = new GetProjectsUseCase(projectRepository);
export const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
export const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);

// Dependency injection container
export const container = {
  // Repositories
  repositories: {
    project: projectRepository,
  },

  // Use cases
  useCases: {
    project: {
      create: createProjectUseCase,
      getAll: getProjectsUseCase,
      update: updateProjectUseCase,
      delete: deleteProjectUseCase,
    },
  },
};

export type Container = typeof container;
