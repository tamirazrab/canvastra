import { describe, expect, it } from "vitest";
import { Project } from "./project.entity";

describe("Project Entity", () => {
	const baseProjectData = {
		id: "test-id",
		name: "Test Project",
		userId: "user-123",
		json: "{}",
		width: 1920,
		height: 1080,
	};

	it("should create a project with required fields", () => {
		const project = new Project(baseProjectData);

		expect(project.id).toBe("test-id");
		expect(project.name).toBe("Test Project");
		expect(project.userId).toBe("user-123");
		expect(project.width).toBe(1920);
		expect(project.height).toBe(1080);
	});

	it("should update JSON immutably", () => {
		const project = new Project(baseProjectData);
		const newJson = '{"objects": []}';
		const updated = project.updateJson(newJson);

		expect(updated.json).toBe(newJson);
		expect(updated.id).toBe(project.id);
		expect(updated).not.toBe(project); // Should be a new instance
	});

	it("should update dimensions immutably", () => {
		const project = new Project(baseProjectData);
		const updated = project.updateDimensions(800, 600);

		expect(updated.width).toBe(800);
		expect(updated.height).toBe(600);
		expect(updated.id).toBe(project.id);
		expect(updated).not.toBe(project);
	});

	it("should check if project belongs to user", () => {
		const project = new Project(baseProjectData);

		expect(project.belongsTo("user-123")).toBe(true);
		expect(project.belongsTo("user-456")).toBe(false);
	});

	it("should update thumbnail immutably", () => {
		const project = new Project(baseProjectData);
		const thumbnailUrl = "https://example.com/thumb.png";
		const updated = project.updateThumbnail(thumbnailUrl);

		expect(updated.thumbnailUrl).toBe(thumbnailUrl);
		expect(updated.id).toBe(project.id);
		expect(updated).not.toBe(project);
	});
});
