import type { ProjectRepository } from "../../domain/repositories";

export interface DeleteProjectRequest {
	userId: string;
	projectId: string;
}

export interface DeleteProjectResponse {
	success: boolean;
}

export interface IDeleteProjectUseCase {
	execute(request: DeleteProjectRequest): Promise<DeleteProjectResponse>;
}

export class DeleteProjectUseCase implements IDeleteProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(request: DeleteProjectRequest): Promise<DeleteProjectResponse> {
		const { userId, projectId } = request;

		const project = await this.projectRepository.findByUserIdAndId(
			userId,
			projectId,
		);

		if (!project) {
			throw new Error("Project not found");
		}

		if (!project.belongsTo(userId)) {
			throw new Error("Unauthorized to delete this project");
		}

		await this.projectRepository.delete(projectId, userId);

		return { success: true };
	}
}
