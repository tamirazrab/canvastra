import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { aiModuleKey } from "@/feature/core/ai/data/ai-module-key";
import AiRepository, {
  aiRepoKey,
} from "@/feature/core/ai/domain/i-repo/ai.repository.interface";

export default async function generateImageUseCase(
  prompt: string,
): Promise<ApiEither<string>> {
  const repo = diResolve<AiRepository>(aiModuleKey, aiRepoKey);

  return repo.generateImage(prompt)();
}
