import { eq, and, desc, asc } from "drizzle-orm";
import type { Project } from "@canvastra-next-js/core/domain/entities";
import type { ProjectRepository } from "@canvastra-next-js/core/domain/repositories";
import { db } from "@canvastra-next-js/db";
import { project as projectTable } from "@canvastra-next-js/db/schema/canvastra";
import { Project as ProjectEntity } from "@canvastra-next-js/core/domain/entities";

export class DrizzleProjectRepository implements ProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const result = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, id))
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
      .from(projectTable)
      .where(eq(projectTable.userId, userId))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(projectTable.updatedAt));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByUserIdAndId(userId: string, id: string): Promise<Project | null> {
    const result = await db
      .select()
      .from(projectTable)
      .where(and(eq(projectTable.id, id), eq(projectTable.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async save(project: Project): Promise<Project> {
    const result = await db
      .insert(projectTable)
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
        target: projectTable.id,
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
      .insert(projectTable)
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
      .update(projectTable)
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
      .where(eq(projectTable.id, project.id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Project with id ${project.id} not found`);
    }

    return this.mapToEntity(result[0]);
  }

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(projectTable)
      .where(and(eq(projectTable.id, id), eq(projectTable.userId, userId)));
  }

  async findTemplates(page: number = 1, limit: number = 10): Promise<Project[]> {
    const result = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.isTemplate, true))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(asc(projectTable.isPro), desc(projectTable.updatedAt));

    return result.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof projectTable.$inferSelect): Project {
    return new ProjectEntity({
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
