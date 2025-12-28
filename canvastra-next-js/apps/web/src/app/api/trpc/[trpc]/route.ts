import { appRouter } from "@canvastra-next-js/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth } from "@canvastra-next-js/auth";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      return {
        session,
      };
    },
  });

export { handler as GET, handler as POST };
