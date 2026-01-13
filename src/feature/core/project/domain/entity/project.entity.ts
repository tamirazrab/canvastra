export type ProjectParams = Omit<Project, "toPlainObject">;

export default class Project {
  readonly id: string;

  readonly name: string;

  readonly userId: string;

  readonly json: string;

  readonly height: number;

  readonly width: number;

  readonly thumbnailUrl?: string;

  readonly isTemplate?: boolean;

  readonly isPro?: boolean;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  constructor(params: ProjectParams) {
    this.id = params.id;
    this.name = params.name;
    this.userId = params.userId;
    this.json = params.json;
    this.height = params.height;
    this.width = params.width;
    this.thumbnailUrl = params.thumbnailUrl;
    this.isTemplate = params.isTemplate;
    this.isPro = params.isPro;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): ProjectParams {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      json: this.json,
      height: this.height,
      width: this.width,
      thumbnailUrl: this.thumbnailUrl,
      isTemplate: this.isTemplate,
      isPro: this.isPro,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
