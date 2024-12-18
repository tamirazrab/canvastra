import { Hono } from "hono";

import ai from "./ai";
import users from "./users";
import images from "./images";
import projects from "./projects";
import subscriptions from "./subscriptions";
import auth from "../auth/[...route]";
import uploadthing from "../uploadthing/route";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", auth)
  .route("/uploadthing", uploadthing)
  .route("/ai", ai)
  .route("/users", users)
  .route("/images", images)
  .route("/projects", projects)
  .route("/subscriptions", subscriptions);

export default app;

export type AppType = typeof routes;
