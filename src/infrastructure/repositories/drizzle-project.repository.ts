import { eq, and, desc, asc } from "drizzle-orm";
import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";
import { db } from "@/infrastructure/db/drizzle";
import { projects } from "@/infrastructure/db/schema";

export class DrizzleProjectRepository implements ProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(projects.updatedAt));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByUserIdAndId(userId: string, id: string): Promise<Project | null> {
    const result = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async save(project: Project): Promise<Project> {
    const result = await db
      .insert(projects)
      .values({
        id: project.id,
        name: project.name,
        userId: project.userId,
        json: project.json,
        height: project.height,
        width: project.width,
        thumbnailUrl: project.thumbnailUrl,
        isTemplate: project.isTemplate,
        isPro: project.isPro,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          name: project.name,
          json: project.json,
          height: project.height,
          width: project.width,
          thumbnailUrl: project.thumbnailUrl,
          isTemplate: project.isTemplate,
          isPro: project.isPro,
          updatedAt: project.updatedAt,
        },
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async create(projectData: {
    name: string;
    userId: string;
    json: string;
    height: number;
    width: number;
    thumbnailUrl?: string | null;
    isTemplate?: boolean | null;
    isPro?: boolean | null;
  }): Promise<Project> {
    const now = new Date();
    const result = await db
      .insert(projects)
      .values({
        name: projectData.name,
        userId: projectData.userId,
        json: projectData.json,
        height: projectData.height,
        width: projectData.width,
        thumbnailUrl: projectData.thumbnailUrl ?? null,
        isTemplate: projectData.isTemplate ?? null,
        isPro: projectData.isPro ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async update(project: Project): Promise<Project> {
    const result = await db
      .update(projects)
      .set({
        name: project.name,
        json: project.json,
        height: project.height,
        width: project.width,
        thumbnailUrl: project.thumbnailUrl,
        isTemplate: project.isTemplate,
        isPro: project.isPro,
        updatedAt: project.updatedAt,
      })
      .where(eq(projects.id, project.id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Project with id ${project.id} not found`);
    }

    return this.mapToEntity(result[0]);
  }

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  }

  async findTemplates(page: number = 1, limit: number = 10): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.isTemplate, true))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(asc(projects.isPro), desc(projects.updatedAt));

    return result.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof projects.$inferSelect): Project {
    return new Project({
      id: row.id,
      name: row.name,
      userId: row.userId,
      json: row.json,
      height: row.height,
      width: row.width,
      thumbnailUrl: row.thumbnailUrl,
      isTemplate: row.isTemplate,
      isPro: row.isPro,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

