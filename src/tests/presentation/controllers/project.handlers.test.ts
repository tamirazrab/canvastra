import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getProjectHandler,
  getProjectsHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from "@/presentation/controllers/project.handlers";
import { container } from "@/infrastructure/di";
import { Project } from "@/core/domain/entities";
import type { Context } from "hono";
import {
  IGetProjectUseCase,
  IGetProjectsUseCase,
  ICreateProjectUseCase,
  IUpdateProjectUseCase,
  IDeleteProjectUseCase,
} from "@/core/application/use-cases/project";
import { EntityNotFoundException, UnauthorizedException } from "@/core/domain/exceptions";

function createMockProject(overrides?: Partial<Parameters<typeof Project.prototype.constructor>[0]>) {
  return new Project({
    id: "1",
    name: "Test Project",
    userId: "user1",
    json: "{}",
    width: 800,
    height: 600,
    thumbnailUrl: null,
    isTemplate: false,
    isPro: false,
    ...overrides,
  });
}

function createMockContext(overrides?: Partial<Context>): Context {
  return {
    get: vi.fn((key: string) => {
      if (key === "userId") return "user1";
      return undefined;
    }),
    req: {
      param: vi.fn((key: string) => {
        if (key === "id") return "1";
        return undefined;
      }),
      query: vi.fn((key: string) => {
        if (key === "page") return "1";
        if (key === "limit") return "10";
        return undefined;
      }),
      json: vi.fn(async () => ({
        name: "New Project",
        json: "{}",
        width: 800,
        height: 600,
      })),
    },
    json: vi.fn((data: unknown, status?: number) => ({ data, status })),
    ...overrides,
  } as unknown as Context;
}

describe("project.handlers", () => {
  let getProjectUseCaseMock: IGetProjectUseCase;
  let getProjectsUseCaseMock: IGetProjectsUseCase;
  let createProjectUseCaseMock: ICreateProjectUseCase;
  let updateProjectUseCaseMock: IUpdateProjectUseCase;
  let deleteProjectUseCaseMock: IDeleteProjectUseCase;

  beforeEach(() => {
    getProjectUseCaseMock = {
      execute: vi.fn(),
    } as unknown as IGetProjectUseCase;

    getProjectsUseCaseMock = {
      execute: vi.fn(),
    } as unknown as IGetProjectsUseCase;

    createProjectUseCaseMock = {
      execute: vi.fn(),
    } as unknown as ICreateProjectUseCase;

    updateProjectUseCaseMock = {
      execute: vi.fn(),
    } as unknown as IUpdateProjectUseCase;

    deleteProjectUseCaseMock = {
      execute: vi.fn(),
    } as unknown as IDeleteProjectUseCase;

    // Mock DI container methods
    vi.spyOn(container, "getGetProjectUseCase").mockReturnValue(getProjectUseCaseMock);
    vi.spyOn(container, "getGetProjectsUseCase").mockReturnValue(getProjectsUseCaseMock);
    vi.spyOn(container, "getCreateProjectUseCase").mockReturnValue(createProjectUseCaseMock);
    vi.spyOn(container, "getUpdateProjectUseCase").mockReturnValue(updateProjectUseCaseMock);
    vi.spyOn(container, "getDeleteProjectUseCase").mockReturnValue(deleteProjectUseCaseMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getProjectHandler", () => {
    it("should return project on success", async () => {
      const mockProject = createMockProject();
      vi.mocked(getProjectUseCaseMock.execute).mockResolvedValue({
        project: mockProject,
      });

      const c = createMockContext();
      const result = await getProjectHandler(c);

      expect(result.status).toBe(200);
      expect(getProjectUseCaseMock.execute).toHaveBeenCalledWith({
        projectId: "1",
        userId: "user1",
      });
    });

    it("should return 401 when unauthorized", async () => {
      const c = createMockContext({
        get: vi.fn(() => undefined),
      } as Partial<Context>);

      const result = await getProjectHandler(c);

      expect(result.status).toBe(401);
    });

    it("should return 404 when project not found", async () => {
      vi.mocked(getProjectUseCaseMock.execute).mockRejectedValue(
        new EntityNotFoundException("Project", "1")
      );

      const c = createMockContext();
      const result = await getProjectHandler(c);

      expect(result.status).toBe(404);
    });
  });

  describe("getProjectsHandler", () => {
    it("should return projects on success", async () => {
      const mockProjects = [createMockProject()];
      vi.mocked(getProjectsUseCaseMock.execute).mockResolvedValue({
        projects: mockProjects,
        nextPage: null,
      });

      const c = createMockContext();
      const result = await getProjectsHandler(c);

      expect(result.status).toBe(200);
      expect(getProjectsUseCaseMock.execute).toHaveBeenCalledWith({
        userId: "user1",
        page: 1,
        limit: 10,
      });
    });
  });

  describe("createProjectHandler", () => {
    it("should create project on success", async () => {
      const mockProject = createMockProject();
      vi.mocked(createProjectUseCaseMock.execute).mockResolvedValue({
        project: mockProject,
      });

      const c = createMockContext();
      const result = await createProjectHandler(c);

      expect(result.status).toBe(200);
      expect(createProjectUseCaseMock.execute).toHaveBeenCalled();
    });
  });

  describe("updateProjectHandler", () => {
    it("should update project on success", async () => {
      const mockProject = createMockProject();
      vi.mocked(updateProjectUseCaseMock.execute).mockResolvedValue({
        project: mockProject,
      });

      const c = createMockContext();
      const result = await updateProjectHandler(c);

      expect(result.status).toBe(200);
    });

    it("should return 401 when unauthorized", async () => {
      vi.mocked(updateProjectUseCaseMock.execute).mockRejectedValue(
        new UnauthorizedException()
      );

      const c = createMockContext();
      const result = await updateProjectHandler(c);

      expect(result.status).toBe(401);
    });
  });

  describe("deleteProjectHandler", () => {
    it("should delete project on success", async () => {
      vi.mocked(deleteProjectUseCaseMock.execute).mockResolvedValue({
        success: true,
      });

      const c = createMockContext();
      const result = await deleteProjectHandler(c);

      expect(result.status).toBe(200);
    });

    it("should return 404 when project not found", async () => {
      vi.mocked(deleteProjectUseCaseMock.execute).mockRejectedValue(
        new EntityNotFoundException("Project", "1")
      );

      const c = createMockContext();
      const result = await deleteProjectHandler(c);

      expect(result.status).toBe(404);
    });
  });
});

