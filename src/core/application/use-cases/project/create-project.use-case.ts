import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";

export interface CreateProjectRequest {
  userId: string;
  name: string;
  json: string;
  width: number;
  height: number;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface ICreateProjectUseCase {
  execute(request: CreateProjectRequest): Promise<CreateProjectResponse>;
}

export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(
    request: CreateProjectRequest
  ): Promise<CreateProjectResponse> {
    const { userId, name, json, width, height } = request;

    const project = await this.projectRepository.create({
      name,
      userId,
      json,
      width,
      height,
    });

    return { project };
  }
}

