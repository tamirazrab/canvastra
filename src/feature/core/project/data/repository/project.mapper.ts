import WithPagination from "@/feature/common/class-helpers/with-pagination";
import ResponseFailure from "@/feature/common/failures/dev/response.failure";
import Project, {
  ProjectParams,
} from "@/feature/core/project/domain/entity/project.entity";
import { projects } from "@/bootstrap/boundaries/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type ProjectDbResponse = InferSelectModel<typeof projects>;

export default class ProjectMapper {
  static mapToEntity(dbProject: ProjectDbResponse): ProjectParams {
    try {
      return new Project({
        id: dbProject.id,
        name: dbProject.name,
        userId: dbProject.userId,
        json: dbProject.json,
        height: dbProject.height,
        width: dbProject.width,
        thumbnailUrl: dbProject.thumbnailUrl ?? undefined,
        isTemplate: dbProject.isTemplate ?? undefined,
        isPro: dbProject.isPro ?? undefined,
        createdAt: dbProject.createdAt,
        updatedAt: dbProject.updatedAt,
      }).toPlainObject();
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }

  static mapToEntityList(dbProjects: ProjectDbResponse[]): ProjectParams[] {
    try {
      return dbProjects.map((project) => this.mapToEntity(project));
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }

  static mapToPaginatedEntity(
    dbProjects: ProjectDbResponse[],
    total: number,
  ): WithPagination<ProjectParams> {
    try {
      const projects = this.mapToEntityList(dbProjects);
      return new WithPagination(projects, total).toPlainObject();
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }
}
