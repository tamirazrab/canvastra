import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../domain/entities";
import type { ProjectRepository } from "../../../domain/repositories";
import { CreateProjectUseCase } from "./create-project.use-case";

describe("CreateProjectUseCase", () => {
	let mockRepository: ProjectRepository;
	let useCase: CreateProjectUseCase;

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

		useCase = new CreateProjectUseCase(mockRepository);
	});

	it("should create a project successfully", async () => {
		const request = {
			userId: "user-123",
			name: "New Project",
			json: "{}",
			width: 1920,
			height: 1080,
		};

		const mockProject = new Project({
			id: "project-123",
			...request,
		});

		vi.mocked(mockRepository.create).mockResolvedValue(mockProject);

		const result = await useCase.execute(request);

		expect(mockRepository.create).toHaveBeenCalledWith({
			name: request.name,
			userId: request.userId,
			json: request.json,
			width: request.width,
			height: request.height,
		});

		expect(result.project).toEqual(mockProject);
	});

	it("should handle repository errors", async () => {
		const request = {
			userId: "user-123",
			name: "New Project",
			json: "{}",
			width: 1920,
			height: 1080,
		};

		vi.mocked(mockRepository.create).mockRejectedValue(
			new Error("Database error"),
		);

		await expect(useCase.execute(request)).rejects.toThrow("Database error");
	});
});
