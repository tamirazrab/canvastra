import { Hono } from "hono";
import { unsplash } from "@canvastra-next-js/infrastructure/services/unsplash";
import { auth } from "@canvastra-next-js/auth";

const DEFAULT_COUNT = 50;
const DEFAULT_COLLECTION_IDS = ["317099"];

const images = new Hono()
  .get("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const imagesFn = await unsplash.photos.getRandom({
      collectionIds: DEFAULT_COLLECTION_IDS,
      count: DEFAULT_COUNT,
    });

    if (imagesFn.errors) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    let response = imagesFn.response;

    if (!Array.isArray(response)) {
      response = [response];
    }

    return c.json({ data: response });
  });

export default images;
