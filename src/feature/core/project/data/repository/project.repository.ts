import { db } from "@/bootstrap/boundaries/db/drizzle";
import { projects } from "@/bootstrap/boundaries/db/schema";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import ApiTask from "@/feature/common/data/api-task";
import { wrapAsync } from "@/feature/common/fp-ts-helpers";
import ProjectMapper from "@/feature/core/project/data/repository/project.mapper";
import Project from "@/feature/core/project/domain/entity/project.entity";
import ProjectNotFoundFailure from "@/feature/core/project/domain/failure/project-not-found.failure";
import ProjectUnauthorizedFailure from "@/feature/core/project/domain/failure/project-unauthorized.failure";
import ProjectRepository from "@/feature/core/project/domain/i-repo/project.repository.interface";
import { CreateProjectParams } from "@/feature/core/project/domain/params/create-project.param-schema";
import { UpdateProjectParams } from "@/feature/core/project/domain/params/update-project.param-schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { pipe } from "fp-ts/lib/function";
import { chain, left, map, right } from "fp-ts/lib/TaskEither";

export default class ProjectRepositoryImpl implements ProjectRepository {
  getPaginatedList(paginationParams: {
    limit?: number;
    skip?: number;
    userId: string;
  }): ApiTask<WithPagination<Project>> {
    return pipe(
      wrapAsync(async () => {
        const limit = paginationParams.limit ?? 5;
        const offset = paginationParams.skip ?? 0;

        const data = await db
          .select()
          .from(projects)
          .where(eq(projects.userId, paginationParams.userId))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(projects.updatedAt));

        const total = await db
          .select()
          .from(projects)
          .where(eq(projects.userId, paginationParams.userId));

        return {
          data,
          total: total.length,
        };
      }),
      map((response) =>
        ProjectMapper.mapToPaginatedEntity(response.data, response.total),
      ),
    ) as ApiTask<WithPagination<Project>>;
  }

  getById(id: string, userId: string): ApiTask<Project> {
    return pipe(
      wrapAsync(async () => {
        const data = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, id), eq(projects.userId, userId)));

        return data.length === 0 ? null : data[0];
      }),
      chain((project) => {
        if (!project) {
          return left(new ProjectNotFoundFailure({ id }).toPlainObject()) as ApiTask<Project>;
        }
        return right(ProjectMapper.mapToEntity(project)) as ApiTask<Project>;
      }),
    ) as ApiTask<Project>;
  }

  getTemplates(paginationParams: {
    limit?: number;
    skip?: number;
  }): ApiTask<WithPagination<Project>> {
    return pipe(
      wrapAsync(async () => {
        const limit = paginationParams.limit ?? 5;
        const offset = paginationParams.skip ?? 0;

        const data = await db
          .select()
          .from(projects)
          .where(eq(projects.isTemplate, true))
          .limit(limit)
          .offset(offset)
          .orderBy(asc(projects.isPro), desc(projects.updatedAt));

        const total = await db
          .select()
          .from(projects)
          .where(eq(projects.isTemplate, true));

        return {
          data,
          total: total.length,
        };
      }),
      map((response) =>
        ProjectMapper.mapToPaginatedEntity(response.data, response.total),
      ),
    ) as ApiTask<WithPagination<Project>>;
  }

  create(params: CreateProjectParams & { userId: string }): ApiTask<Project> {
    return pipe(
      wrapAsync(async () => {
        const [data] = await db
          .insert(projects)
          .values({
            name: params.name,
            json: params.json,
            height: params.height,
            width: params.width,
            userId: params.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return data;
      }),
      chain((data) => right(ProjectMapper.mapToEntity(data))),
    ) as ApiTask<Project>;
  }

  update(params: UpdateProjectParams & { userId: string }): ApiTask<Project> {
    return pipe(
      wrapAsync(async () => {
        const updateData: Partial<typeof projects.$inferInsert> = {
          updatedAt: new Date(),
        };

        if (params.name !== undefined) updateData.name = params.name;
        if (params.json !== undefined) updateData.json = params.json;
        if (params.height !== undefined) updateData.height = params.height;
        if (params.width !== undefined) updateData.width = params.width;
        if (params.thumbnailUrl !== undefined)
          updateData.thumbnailUrl = params.thumbnailUrl;

        const [data] = await db
          .update(projects)
          .set(updateData)
          .where(
            and(
              eq(projects.id, params.id),
              eq(projects.userId, params.userId),
            ),
          )
          .returning();

        return data ?? null;
      }),
      chain((project) => {
        if (!project) {
          return left(
            new ProjectUnauthorizedFailure({ id: params.id }).toPlainObject(),
          ) as ApiTask<Project>;
        }
        return right(ProjectMapper.mapToEntity(project)) as ApiTask<Project>;
      }),
    ) as ApiTask<Project>;
  }

  delete(id: string, userId: string): ApiTask<true> {
    return pipe(
      wrapAsync(async () => {
        const [data] = await db
          .delete(projects)
          .where(and(eq(projects.id, id), eq(projects.userId, userId)))
          .returning();

        return data ? true : null;
      }),
      chain((result) => {
        if (!result) {
          return left(
            new ProjectUnauthorizedFailure({ id }).toPlainObject(),
          ) as ApiTask<true>;
        }
        return right(true) as ApiTask<true>;
      }),
    ) as ApiTask<true>;
  }

  duplicate(id: string, userId: string): ApiTask<Project> {
    return pipe(
      wrapAsync(async () => {
        const [original] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, id), eq(projects.userId, userId)));

        if (!original) {
          return null;
        }

        const [duplicate] = await db
          .insert(projects)
          .values({
            name: `Copy of ${original.name}`,
            json: original.json,
            width: original.width,
            height: original.height,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return duplicate;
      }),
      chain((project) => {
        if (!project) {
          return left(
            new ProjectNotFoundFailure({ id }).toPlainObject(),
          ) as ApiTask<Project>;
        }
        return right(ProjectMapper.mapToEntity(project)) as ApiTask<Project>;
      }),
    ) as ApiTask<Project>;
  }
}
