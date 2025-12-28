import { useInfiniteQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export const useGetProjects = (userId: string) => {
	const query = useInfiniteQuery({
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		queryKey: ["projects", { userId }],
		queryFn: async ({ pageParam }) => {
			const result = await trpc.project.list.query({
				userId,
				page: pageParam as number,
				limit: 5,
			});
			return result;
		},
	});

	return query;
};
