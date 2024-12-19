import { describe, it, expect } from "vitest";
import { Project } from "@/core/domain/entities";

describe("Project", () => {
  const createProject = (overrides?: Partial<Parameters<typeof Project.prototype.constructor>[0]>) => {
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
  };

  it("should create a project", () => {
    const project = createProject();

    expect(project.id).toBe("1");
    expect(project.name).toBe("Test Project");
    expect(project.userId).toBe("user1");
    expect(project.json).toBe("{}");
    expect(project.width).toBe(800);
    expect(project.height).toBe(600);
  });

  it("should update JSON", () => {
    const project = createProject();
    const updated = project.updateJson('{"key": "value"}');

    expect(updated.json).toBe('{"key": "value"}');
    expect(updated.id).toBe(project.id);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(project.updatedAt.getTime());
  });

  it("should update dimensions", () => {
    const project = createProject();
    const updated = project.updateDimensions(1920, 1080);

    expect(updated.width).toBe(1920);
    expect(updated.height).toBe(1080);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(project.updatedAt.getTime());
  });

  it("should update thumbnail", () => {
    const project = createProject();
    const updated = project.updateThumbnail("https://example.com/thumb.jpg");

    expect(updated.thumbnailUrl).toBe("https://example.com/thumb.jpg");
    expect(updated.updatedAt.getTime()).toBeGreaterThan(project.updatedAt.getTime());
  });

  it("should mark as template", () => {
    const project = createProject({ isTemplate: false });
    const updated = project.markAsTemplate();

    expect(updated.isTemplate).toBe(true);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(project.updatedAt.getTime());
  });

  it("should check if belongs to user", () => {
    const project = createProject({ userId: "user1" });

    expect(project.belongsTo("user1")).toBe(true);
    expect(project.belongsTo("user2")).toBe(false);
  });
});

