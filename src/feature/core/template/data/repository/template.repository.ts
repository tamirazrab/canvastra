import { db } from "@/bootstrap/boundaries/db/drizzle";
import { templates } from "@/bootstrap/boundaries/db/schema";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import ApiTask from "@/feature/common/data/api-task";
import { wrapAsync } from "@/feature/common/fp-ts-helpers";
import TemplateMapper from "@/feature/core/template/data/repository/template.mapper";
import Template from "@/feature/core/template/domain/entity/template.entity";
import TemplateRepository from "@/feature/core/template/domain/i-repo/template.repository.interface";
import { asc, desc, sql } from "drizzle-orm";
import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/TaskEither";

export default class TemplateRepositoryImpl implements TemplateRepository {
  getPaginated(paginationParams: {
    limit?: number;
    skip?: number;
  }): ApiTask<WithPagination<Template>> {
    return pipe(
      wrapAsync(async () => {
        const limit = paginationParams.limit ?? 5;
        const offset = paginationParams.skip ?? 0;

        const rows = await db
          .select({
            id: templates.id,
            name: templates.name,
            json: templates.json,
            height: templates.height,
            width: templates.width,
            thumbnailUrl: templates.thumbnailUrl,
            isPro: templates.isPro,
            createdAt: templates.createdAt,
            updatedAt: templates.updatedAt,
            total: sql<number>`count(*) over()`.as("total"),
          })
          .from(templates)
          .limit(limit)
          .offset(offset)
          .orderBy(asc(templates.isPro), desc(templates.updatedAt));

        const total = rows[0]?.total ?? 0;
        const data = rows.map(({ total: _total, ...row }) => row);
        return {
          data,
          total,
        };
      }),
      map((response) =>
        TemplateMapper.mapToPaginatedEntity(response.data, response.total),
      ),
    ) as ApiTask<WithPagination<Template>>;
  }
}
