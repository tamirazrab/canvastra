import { z } from "zod";
import { publicProcedure, router } from "../index";
import { unsplash } from "@canvastra-next-js/infrastructure";

const DEFAULT_COUNT = 50;
const DEFAULT_COLLECTION_IDS = ["317099"];

export const imagesRouter = router({
  getImages: publicProcedure
    .query(async () => {
      const images = await unsplash.photos.getRandom({
        collectionIds: DEFAULT_COLLECTION_IDS,
        count: DEFAULT_COUNT,
      });

      if (images.errors) {
        throw new Error("Failed to fetch images");
      }

      let response = images.response;
      if (!Array.isArray(response)) {
        response = [response];
      }

      return response;
    }),
});

export type ImagesRouter = typeof imagesRouter;
