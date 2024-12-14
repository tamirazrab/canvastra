import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";

export interface DuplicateProjectRequest {
  projectId: string;
  userId: string;
}

export interface DuplicateProjectResponse {
  project: Project;
}

export interface IDuplicateProjectUseCase {
  execute(request: DuplicateProjectRequest): Promise<DuplicateProjectResponse>;
}

export class DuplicateProjectUseCase implements IDuplicateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(
    request: DuplicateProjectRequest
  ): Promise<DuplicateProjectResponse> {
    const { projectId, userId } = request;

    // Get original project
    const originalProject =
      await this.projectRepository.findByUserIdAndId(userId, projectId);
    if (!originalProject) {
      throw new Error("Project not found or unauthorized");
    }

    // Create duplicate
    const duplicateProject = await this.projectRepository.create({
      name: `Copy of ${originalProject.name}`,
      userId,
      json: originalProject.json,
      width: originalProject.width,
      height: originalProject.height,
      thumbnailUrl: originalProject.thumbnailUrl,
      isTemplate: originalProject.isTemplate,
      isPro: originalProject.isPro,
    });

    return { project: duplicateProject };
  }
}

