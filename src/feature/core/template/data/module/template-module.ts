import TemplateRepositoryImpl from "@/feature/core/template/data/repository/template.repository";
import { templateRepoKey } from "@/feature/core/template/domain/i-repo/template.repository.interface";
import { DependencyContainer } from "tsyringe";

export default function templateModule(di: DependencyContainer) {
  di.register(templateRepoKey, TemplateRepositoryImpl);

  return di;
}
