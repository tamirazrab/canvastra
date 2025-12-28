import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

type DeleteProjectInput = {
	userId: string;
	projectId: string;
};

export const useDeleteProject = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (input: DeleteProjectInput) => {
			await trpc.project.delete.mutate(input);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({
				queryKey: ["project", { id: variables.projectId }],
			});
		},
		onError: () => {
			toast.error("Failed to delete project");
		},
	});

	return mutation;
};
