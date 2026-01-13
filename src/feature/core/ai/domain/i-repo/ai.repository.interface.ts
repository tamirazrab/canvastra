import ApiTask from "@/feature/common/data/api-task";

export default interface AiRepository {
  generateImage(prompt: string): ApiTask<string>;

  removeBackground(image: string): ApiTask<string>;
}

export const aiRepoKey = "aiRepoKey";
