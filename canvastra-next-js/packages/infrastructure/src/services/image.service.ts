import type { ImageService } from "@canvastra-next-js/core/domain/services/image.service";
import { unsplash } from "./unsplash";

export class UnsplashImageService implements ImageService {
	async getImages(
		count = 50,
		collectionIds: string[] = ["317099"],
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
	> {
		const response = await unsplash.photos.getRandom({
			collectionIds,
			count,
		});

		if (response.errors) {
			throw new Error("Failed to fetch images");
		}

		let photos = response.response;
		if (!Array.isArray(photos)) {
			photos = [photos];
		}

		return photos.map((photo) => ({
			id: photo.id,
			urls: {
				regular: photo.urls.regular,
				small: photo.urls.small,
				thumb: photo.urls.thumb,
			},
			description: photo.description,
			alt_description: photo.alt_description,
		}));
	}
}
