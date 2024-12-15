import { createApi } from "unsplash-js";
import { ImageSearchService, ImageSearchResult } from "@/core/domain/services";

export class UnsplashService implements ImageSearchService {
  private readonly client: ReturnType<typeof createApi>;

  constructor() {
    this.client = createApi({
      accessKey: process.env.VITE_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY!,
      fetch: fetch,
    });
  }

  async searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<ImageSearchResult> {
    const result = await this.client.search.getPhotos({
      query,
      page,
      perPage,
    });
    return {
      errors: result.errors,
      response: result.response,
    };
  }

  async getPhotos(page: number = 1, perPage: number = 20): Promise<ImageSearchResult> {
    const result = await this.client.photos.list({
      page,
      perPage,
    });
    return {
      errors: result.errors,
      response: result.response,
    };
  }

  async getRandomPhotos(collectionIds: string[] = ["317099"], count: number = 50): Promise<ImageSearchResult> {
    const result = await this.client.photos.getRandom({
      collectionIds,
      count,
    });
    return {
      errors: result.errors,
      response: result.response,
    };
  }
}

