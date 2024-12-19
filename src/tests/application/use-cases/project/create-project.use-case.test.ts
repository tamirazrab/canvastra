import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateProjectUseCase } from "@/core/application/use-cases/project";
import { ProjectRepository } from "@/core/domain/repositories";
import { Project } from "@/core/domain/entities";

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
    const projectData = {
      userId: "user1",
      name: "Test Project",
      json: "{}",
      width: 800,
      height: 600,
    };

    const expectedProject = new Project({
      id: "1",
      ...projectData,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    vi.mocked(mockRepository.create).mockResolvedValue(expectedProject);

    const result = await useCase.execute(projectData);

    expect(result.project).toEqual(expectedProject);
    expect(mockRepository.create).toHaveBeenCalledWith(projectData);
  });
});

