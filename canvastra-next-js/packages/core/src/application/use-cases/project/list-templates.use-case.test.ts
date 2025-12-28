import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../domain/entities";
import type { ProjectRepository } from "../../../domain/repositories";
import { ListTemplatesUseCase } from "./list-templates.use-case";

describe("ListTemplatesUseCase", () => {
	let mockRepository: ProjectRepository;
	let useCase: ListTemplatesUseCase;

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

		useCase = new ListTemplatesUseCase(mockRepository);
	});

	it("should list templates successfully", async () => {
		const page = 1;
		const limit = 10;

		const mockTemplates = [
			new Project({
				id: "template-1",
				name: "Template 1",
				userId: "system",
				json: "{}",
				width: 1920,
				height: 1080,
				isTemplate: true,
			}),
			new Project({
				id: "template-2",
				name: "Template 2",
				userId: "system",
				json: "{}",
				width: 1920,
				height: 1080,
				isTemplate: true,
			}),
		];

		vi.mocked(mockRepository.findTemplates).mockResolvedValue(mockTemplates);

		const result = await useCase.execute({ page, limit });

		expect(mockRepository.findTemplates).toHaveBeenCalledWith(page, limit);
		expect(result.projects).toEqual(mockTemplates);
		expect(result.projects.length).toBe(2);
	});

	it("should handle empty templates list", async () => {
		const page = 1;
		const limit = 10;

		vi.mocked(mockRepository.findTemplates).mockResolvedValue([]);

		const result = await useCase.execute({ page, limit });

		expect(result.projects).toEqual([]);
	});
});
