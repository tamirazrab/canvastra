import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

type GenerateImageInput = {
	prompt: string;
};

export const useGenerateImage = () => {
	const mutation = useMutation({
		mutationFn: async (input: GenerateImageInput) => {
			const result = await trpc.ai.generateImage.mutate(input);
			return result;
		},
	});

	return mutation;
};
