export type TemplateParams = Omit<Template, "toPlainObject">;

export default class Template {
  readonly id: string;

  readonly name: string;

  readonly json: string;

  readonly height: number;

  readonly width: number;

  readonly thumbnailUrl?: string;

  readonly isPro?: boolean;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  constructor(params: TemplateParams) {
    this.id = params.id;
    this.name = params.name;
    this.json = params.json;
    this.height = params.height;
    this.width = params.width;
    this.thumbnailUrl = params.thumbnailUrl;
    this.isPro = params.isPro;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): TemplateParams {
    return {
      id: this.id,
      name: this.name,
      json: this.json,
      height: this.height,
      width: this.width,
      thumbnailUrl: this.thumbnailUrl,
      isPro: this.isPro,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
