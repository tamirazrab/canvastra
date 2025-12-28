import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

type RemoveBgInput = {
	image: string;
};

export const useRemoveBg = () => {
	const mutation = useMutation({
		mutationFn: async (input: RemoveBgInput) => {
			const result = await trpc.ai.removeBg.mutate(input);
			return result;
		},
	});

	return mutation;
};
