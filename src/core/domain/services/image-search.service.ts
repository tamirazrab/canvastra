export interface ImageSearchResult {
  errors?: unknown[];
  response: unknown;
}

export interface ImageSearchService {
  searchPhotos(query: string, page?: number, perPage?: number): Promise<ImageSearchResult>;
  getPhotos(page?: number, perPage?: number): Promise<ImageSearchResult>;
  getRandomPhotos(collectionIds?: string[], count?: number): Promise<ImageSearchResult>;
}

