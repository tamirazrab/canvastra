import type { Project } from "../../domain/entities";
import type { ProjectRepository } from "../../domain/repositories";

export interface GetProjectRequest {
	id: string;
	userId?: string;
}

export interface GetProjectResponse {
	project: Project;
}

export interface IGetProjectUseCase {
	execute(request: GetProjectRequest): Promise<GetProjectResponse>;
}

export class GetProjectUseCase implements IGetProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(request: GetProjectRequest): Promise<GetProjectResponse> {
		const { id, userId } = request;

		const project = await this.projectRepository.findById(id);

		if (!project) {
			throw new Error("Project not found");
		}

		// If userId is provided, verify ownership (unless it's a template)
		if (userId && !project.isTemplate && !project.belongsTo(userId)) {
			throw new Error("Unauthorized to access this project");
		}

		return { project };
	}
}
