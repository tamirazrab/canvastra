import WithPagination from "@/feature/common/class-helpers/with-pagination";
import ResponseFailure from "@/feature/common/failures/dev/response.failure";
import Template, {
  TemplateParams,
} from "@/feature/core/template/domain/entity/template.entity";
import { templates } from "@/bootstrap/boundaries/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type TemplateDbResponse = InferSelectModel<typeof templates>;

export default class TemplateMapper {
  static mapToEntity(dbTemplate: TemplateDbResponse): TemplateParams {
    try {
      return new Template({
        id: dbTemplate.id,
        name: dbTemplate.name,
        json: dbTemplate.json,
        height: dbTemplate.height,
        width: dbTemplate.width,
        thumbnailUrl: dbTemplate.thumbnailUrl ?? undefined,
        isPro: dbTemplate.isPro ?? undefined,
        createdAt: dbTemplate.createdAt,
        updatedAt: dbTemplate.updatedAt,
      }).toPlainObject();
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }

  static mapToEntityList(dbTemplates: TemplateDbResponse[]): TemplateParams[] {
    try {
      return dbTemplates.map((template) => this.mapToEntity(template));
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }

  static mapToPaginatedEntity(
    dbTemplates: TemplateDbResponse[],
    total: number,
  ): WithPagination<TemplateParams> {
    try {
      const items = this.mapToEntityList(dbTemplates);
      return new WithPagination(items, total).toPlainObject();
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }
}
