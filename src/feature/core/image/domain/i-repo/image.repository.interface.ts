import ApiTask from "@/feature/common/data/api-task";

export type UnsplashImage = {
  id: string;
  urls: {
    regular: string;
    thumb: string;
    small?: string;
  };
  description?: string;
  alt_description?: string;
  links?: {
    html: string;
  };
  user?: {
    name: string;
  };
};

export default interface ImageRepository {
  getImages(): ApiTask<UnsplashImage[]>;
}

export const imageRepoKey = "imageRepoKey";
