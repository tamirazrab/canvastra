import { ValueObject } from "./value-object";

export class ImageUrl extends ValueObject<string> {
  private static readonly URL_REGEX =
    /^https?:\/\/.+/i;

  protected validate(value: string): string {
    if (!value || value.trim().length === 0) {
      throw new Error("Image URL cannot be empty");
    }

    const trimmed = value.trim();

    if (!ImageUrl.URL_REGEX.test(trimmed)) {
      throw new Error(`Invalid image URL format: ${value}`);
    }

    return trimmed;
  }
}

