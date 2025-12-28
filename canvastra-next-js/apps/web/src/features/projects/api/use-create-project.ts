import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

type CreateProjectInput = {
	name: string;
	userId: string;
	json: string;
	width: number;
	height: number;
};

export const useCreateProject = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (input: CreateProjectInput) => {
			const result = await trpc.project.create.mutate(input);
			return result;
		},
		onSuccess: () => {
			toast.success("Project created.");
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: () => {
			toast.error(
				"Failed to create project. The session token may have expired, logout and login again, and everything will work fine.",
			);
		},
	});

	return mutation;
};
