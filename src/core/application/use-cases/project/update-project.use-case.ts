import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";
import { EntityNotFoundException, UnauthorizedException } from "@/core/domain/exceptions";

export interface UpdateProjectRequest {
  projectId: string;
  userId: string;
  updates: {
    name?: string;
    json?: string;
    width?: number;
    height?: number;
    thumbnailUrl?: string | null;
    isTemplate?: boolean | null;
    isPro?: boolean | null;
  };
}

export interface UpdateProjectResponse {
  project: Project;
}

export interface IUpdateProjectUseCase {
  execute(request: UpdateProjectRequest): Promise<UpdateProjectResponse>;
}

export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(
    request: UpdateProjectRequest
  ): Promise<UpdateProjectResponse> {
    const { projectId, userId, updates } = request;

    // Verify ownership
    const existingProject =
      await this.projectRepository.findByUserIdAndId(userId, projectId);
    if (!existingProject) {
      throw new EntityNotFoundException("Project", projectId);
    }
    if (!existingProject.belongsTo(userId)) {
      throw new UnauthorizedException("You do not have access to this project");
    }

    // Apply updates
    let updatedProject = existingProject;
    if (updates.json !== undefined) {
      updatedProject = updatedProject.updateJson(updates.json);
    }
    if (updates.width !== undefined || updates.height !== undefined) {
      updatedProject = updatedProject.updateDimensions(
        updates.width ?? updatedProject.width,
        updates.height ?? updatedProject.height
      );
    }
    if (updates.thumbnailUrl !== undefined && updates.thumbnailUrl !== null) {
      updatedProject = updatedProject.updateThumbnail(updates.thumbnailUrl);
    }
    if (updates.name !== undefined) {
      updatedProject = new Project({
        ...updatedProject,
        name: updates.name,
        updatedAt: new Date(),
      });
    }
    if (updates.isTemplate !== undefined) {
      updatedProject = new Project({
        ...updatedProject,
        isTemplate: updates.isTemplate,
        updatedAt: new Date(),
      });
    }
    if (updates.isPro !== undefined) {
      updatedProject = new Project({
        ...updatedProject,
        isPro: updates.isPro,
        updatedAt: new Date(),
      });
    }

    const savedProject = await this.projectRepository.update(updatedProject);

    return { project: savedProject };
  }
}

