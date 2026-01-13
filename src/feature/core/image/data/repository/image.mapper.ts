import { UnsplashImage } from "@/feature/core/image/domain/i-repo/image.repository.interface";

type UnsplashApiResponse = {
  id: string;
  urls: {
    regular: string;
    thumb: string;
    small?: string;
  };
  description?: string | null;
  alt_description?: string | null;
  links?: {
    html: string;
  };
  user?: {
    name: string;
  };
};

export default class ImageMapper {
  static mapToEntity(apiImage: UnsplashApiResponse): UnsplashImage {
    return {
      id: apiImage.id,
      urls: {
        regular: apiImage.urls.regular,
        thumb: apiImage.urls.thumb,
        small: apiImage.urls.small,
      },
      description: apiImage.description ?? undefined,
      alt_description: apiImage.alt_description ?? undefined,
      links: apiImage.links,
      user: apiImage.user,
    };
  }

  static mapToEntityList(apiImages: UnsplashApiResponse[]): UnsplashImage[] {
    return apiImages.map((image) => ImageMapper.mapToEntity(image));
  }
}
