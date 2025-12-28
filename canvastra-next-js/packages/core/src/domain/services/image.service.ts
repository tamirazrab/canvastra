export interface ImageService {
  getImages(
    count?: number,
    collectionIds?: string[],
  ): Promise<
    Array<{
      id: string;
      urls: {
        regular: string;
        small: string;
        thumb: string;
      };
      description?: string | null;
      alt_description?: string | null;
    }>
  >;
}
