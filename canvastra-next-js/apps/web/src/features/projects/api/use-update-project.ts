import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpcClient } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";

type UpdateProjectValues = {
	json?: string;
	name?: string;
	width?: number;
	height?: number;
	thumbnailUrl?: string;
};

export const useUpdateProject = (id: string) => {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const mutation = useMutation({
		mutationKey: ["project", { id }],
		mutationFn: async (values: UpdateProjectValues) => {
			if (!session?.user?.id) {
				throw new Error("User not authenticated");
			}

			const result = await trpcClient.project.update.mutate({
				userId: session.user.id,
				projectId: id,
				...values,
			});
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["project", { id }] });
		},
		onError: () => {
			toast.error("Failed to update project");
		},
	});

	return mutation;
};
