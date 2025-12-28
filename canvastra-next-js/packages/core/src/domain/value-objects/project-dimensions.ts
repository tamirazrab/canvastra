import { ValueObject } from "./value-object";

interface ProjectDimensionsValue {
	width: number;
	height: number;
}

export class ProjectDimensions extends ValueObject<ProjectDimensionsValue> {
	protected validate(): void {
		if (!this.value || this.value.width <= 0 || this.value.height <= 0) {
			throw new Error("Project dimensions must be positive numbers");
		}

		if (this.value.width > 10000 || this.value.height > 10000) {
			throw new Error("Project dimensions cannot exceed 10000 pixels");
		}
	}

	public getWidth(): number {
		return this.value.width;
	}

	public getHeight(): number {
		return this.value.height;
	}

	public getAspectRatio(): number {
		return this.value.width / this.value.height;
	}
}
