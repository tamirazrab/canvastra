import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export const useGetSubscription = () => {
	const query = useQuery({
		queryKey: ["subscription"],
		queryFn: async () => {
			const result = await trpc.subscriptions.getCurrent.query();
			return result;
		},
	});

	return query;
};
