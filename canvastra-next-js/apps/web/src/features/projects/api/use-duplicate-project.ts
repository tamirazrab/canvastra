import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

type DuplicateProjectInput = {
	id: string;
	userId: string;
};

export const useDuplicateProject = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (input: DuplicateProjectInput) => {
			const result = await trpc.project.duplicate.mutate(input);
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: () => {
			toast.error("Failed to duplicate project");
		},
	});

	return mutation;
};
