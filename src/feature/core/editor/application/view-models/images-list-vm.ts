"use client";

import { useState, useEffect, useCallback } from "react";
import { getImagesAction } from "../server-actions/get-images-action";
import { UnsplashImage } from "@/feature/core/image/domain/i-repo/image.repository.interface";

export type ImagesListVm = {
  images: UnsplashImage[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  refresh: () => void;
};

export default class ImagesListVM {
  useVM(): ImagesListVm {
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const fetchImages = useCallback(async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const result = await getImagesAction();

        if (!result.success) {
          throw new Error(result.error);
        }

        setImages(result.data);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err.message : "Failed to fetch images",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchImages();
    }, [fetchImages]);

    return {
      images,
      isLoading,
      isError,
      error,
      refresh: fetchImages,
    };
  }
}

