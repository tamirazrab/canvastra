"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { BaseVM } from "reactvvm";

export type ImagesListVm = {
  images: any[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  refresh: () => void;
};

export default class ImagesListVM extends BaseVM<ImagesListVm> {
  useVM(): ImagesListVm {
    const [images, setImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await (client as any).api.images.$get();

        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }

        const data = await response.json();
        setImages(data.data);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err.message : "Failed to fetch images");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchImages();
    }, []);

    const refresh = () => {
      fetchImages();
    };

    return {
      images,
      isLoading,
      isError,
      error,
      refresh,
    };
  }
}
