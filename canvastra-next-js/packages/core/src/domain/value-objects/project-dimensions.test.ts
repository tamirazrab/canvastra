import { describe, expect, it } from "vitest";
import { ProjectDimensions } from "./project-dimensions";

describe("ProjectDimensions Value Object", () => {
	it("should create valid dimensions", () => {
		const dimensions = new ProjectDimensions({ width: 1920, height: 1080 });

		expect(dimensions.getWidth()).toBe(1920);
		expect(dimensions.getHeight()).toBe(1080);
	});

	it("should throw error for negative width", () => {
		expect(
			() => new ProjectDimensions({ width: -100, height: 1080 }),
		).toThrow();
	});

	it("should throw error for negative height", () => {
		expect(
			() => new ProjectDimensions({ width: 1920, height: -100 }),
		).toThrow();
	});

	it("should throw error for zero width", () => {
		expect(() => new ProjectDimensions({ width: 0, height: 1080 })).toThrow();
	});

	it("should throw error for zero height", () => {
		expect(() => new ProjectDimensions({ width: 1920, height: 0 })).toThrow();
	});

	it("should throw error for dimensions exceeding maximum", () => {
		expect(
			() => new ProjectDimensions({ width: 10001, height: 1080 }),
		).toThrow();
		expect(
			() => new ProjectDimensions({ width: 1920, height: 10001 }),
		).toThrow();
	});

	it("should calculate aspect ratio", () => {
		const dimensions = new ProjectDimensions({ width: 1920, height: 1080 });
		const aspectRatio = dimensions.getAspectRatio();

		expect(aspectRatio).toBeCloseTo(16 / 9, 2);
	});

	it("should accept maximum allowed dimensions", () => {
		const dimensions = new ProjectDimensions({ width: 10000, height: 10000 });

		expect(dimensions.getWidth()).toBe(10000);
		expect(dimensions.getHeight()).toBe(10000);
	});
});
