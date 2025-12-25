import type { Project } from "../../domain/entities";
import type { ProjectRepository } from "../../domain/repositories";

export interface UpdateProjectRequest {
  userId: string;
  projectId: string;
  json?: string;
  name?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface UpdateProjectResponse {
  project: Project;
}

export interface IUpdateProjectUseCase {
  execute(request: UpdateProjectRequest): Promise<UpdateProjectResponse>;
}

export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) { }

  async execute(
    request: UpdateProjectRequest
  ): Promise<UpdateProjectResponse> {
    const { userId, projectId, json, name, width, height, thumbnailUrl } = request;

    const project = await this.projectRepository.findByUserIdAndId(userId, projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.belongsTo(userId)) {
      throw new Error("Unauthorized to update this project");
    }

    let updatedProject = project;

    if (json) {
      updatedProject = updatedProject.updateJson(json);
    }

    if (width && height) {
      updatedProject = updatedProject.updateDimensions(width, height);
    }

    if (thumbnailUrl) {
      updatedProject = updatedProject.updateThumbnail(thumbnailUrl);
    }

    const savedProject = await this.projectRepository.update(updatedProject);

    return { project: savedProject };
  }
}
