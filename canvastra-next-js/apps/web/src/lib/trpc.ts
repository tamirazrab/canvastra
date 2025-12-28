import type { AppRouter } from "@canvastra-next-js/api/routers/index";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

function getBaseUrl() {
	if (typeof window !== "undefined") return "";
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
		}),
	],
});
