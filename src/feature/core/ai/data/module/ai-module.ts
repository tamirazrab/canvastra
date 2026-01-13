import AiRepositoryImpl from "@/feature/core/ai/data/repository/ai.repository";
import { aiRepoKey } from "@/feature/core/ai/domain/i-repo/ai.repository.interface";
import { DependencyContainer } from "tsyringe";

export default function aiModule(di: DependencyContainer) {
  di.register(aiRepoKey, AiRepositoryImpl);

  return di;
}
