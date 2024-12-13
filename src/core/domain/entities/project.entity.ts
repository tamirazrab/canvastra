import { BaseEntity } from "./base.entity";

export interface ProjectProps {
  id: string;
  name: string;
  userId: string;
  json: string;
  height: number;
  width: number;
  thumbnailUrl: string | null;
  isTemplate: boolean | null;
  isPro: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project extends BaseEntity {
  public readonly name: string;
  public readonly userId: string;
  public readonly json: string;
  public readonly height: number;
  public readonly width: number;
  public readonly thumbnailUrl: string | null;
  public readonly isTemplate: boolean | null;
  public readonly isPro: boolean | null;

  constructor(props: ProjectProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.userId = props.userId;
    this.json = props.json;
    this.height = props.height;
    this.width = props.width;
    this.thumbnailUrl = props.thumbnailUrl;
    this.isTemplate = props.isTemplate ?? false;
    this.isPro = props.isPro ?? false;
  }

  public updateJson(json: string): Project {
    return new Project({
      ...this,
      json,
      updatedAt: new Date(),
    });
  }

  public updateDimensions(width: number, height: number): Project {
    return new Project({
      ...this,
      width,
      height,
      updatedAt: new Date(),
    });
  }

  public updateThumbnail(thumbnailUrl: string): Project {
    return new Project({
      ...this,
      thumbnailUrl,
      updatedAt: new Date(),
    });
  }

  public markAsTemplate(): Project {
    return new Project({
      ...this,
      isTemplate: true,
      updatedAt: new Date(),
    });
  }

  public belongsTo(userId: string): boolean {
    return this.userId === userId;
  }
}

