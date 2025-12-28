import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../domain/entities";
import type { ProjectRepository } from "../../../domain/repositories";
import { DeleteProjectUseCase } from "./delete-project.use-case";

describe("DeleteProjectUseCase", () => {
	let mockRepository: ProjectRepository;
	let useCase: DeleteProjectUseCase;

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndId: vi.fn(),
			save: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findTemplates: vi.fn(),
		};

		useCase = new DeleteProjectUseCase(mockRepository);
	});

	it("should delete project successfully", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		const existingProject = new Project({
			id: projectId,
			name: "Test Project",
			userId,
			json: "{}",
			width: 1920,
			height: 1080,
		});

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(
			existingProject,
		);
		vi.mocked(mockRepository.delete).mockResolvedValue();

		await useCase.execute({ userId, projectId });

		expect(mockRepository.findByUserIdAndId).toHaveBeenCalledWith(
			userId,
			projectId,
		);
		expect(mockRepository.delete).toHaveBeenCalledWith(projectId, userId);
	});

	it("should throw error if project not found", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(null);

		await expect(useCase.execute({ userId, projectId })).rejects.toThrow(
			"Project not found",
		);
	});

	it("should throw error if user does not own project", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		const existingProject = new Project({
			id: projectId,
			name: "Test Project",
			userId: "other-user",
			json: "{}",
			width: 1920,
			height: 1080,
		});

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(
			existingProject,
		);

		await expect(useCase.execute({ userId, projectId })).rejects.toThrow(
			"Unauthorized",
		);
	});
});
