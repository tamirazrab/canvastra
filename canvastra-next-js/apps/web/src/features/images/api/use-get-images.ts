import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

type GetImagesInput = {
	count?: number;
	collectionIds?: string[];
};

export const useGetImages = (input?: GetImagesInput) => {
	const query = useQuery({
		queryKey: ["images", input],
		queryFn: async () => {
			const result = await trpc.images.getImages.query(input ?? {});
			return result;
		},
	});

	return query;
};
