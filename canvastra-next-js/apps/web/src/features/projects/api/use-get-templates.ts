import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

type GetTemplatesInput = {
	page?: number;
	limit?: number;
};

export const useGetTemplates = (input?: GetTemplatesInput) => {
	const query = useQuery({
		queryKey: ["templates", input],
		queryFn: async () => {
			const result = await trpc.project.templates.query(input ?? {});
			return result;
		},
	});

	return query;
};
