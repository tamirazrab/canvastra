import { ValueObject } from "./value-object";

interface ProjectDimensionsValue {
  width: number;
  height: number;
}

export class ProjectDimensions extends ValueObject<ProjectDimensionsValue> {
  protected validate(value: ProjectDimensionsValue): ProjectDimensionsValue {
    if (value.width <= 0 || value.height <= 0) {
      throw new Error("Project dimensions must be positive numbers");
    }

    if (value.width > 10000 || value.height > 10000) {
      throw new Error("Project dimensions cannot exceed 10000 pixels");
    }

    return value;
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
