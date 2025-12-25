import type { Project } from "../entities";

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<Project[]>;
  findByUserIdAndId(userId: string, id: string): Promise<Project | null>;
  save(project: Project): Promise<Project>;
  create(projectData: {
    name: string;
    userId: string;
    json: string;
    height: number;
    width: number;
    thumbnailUrl?: string | null;
    isTemplate?: boolean | null;
    isPro?: boolean | null;
  }): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string, userId: string): Promise<void>;
  findTemplates(page?: number, limit?: number): Promise<Project[]>;
}
