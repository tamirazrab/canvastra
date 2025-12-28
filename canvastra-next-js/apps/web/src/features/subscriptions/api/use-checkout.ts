import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export const useCheckout = () => {
	const mutation = useMutation({
		mutationFn: async () => {
			const result = await trpc.subscriptions.checkout.mutate();
			return result;
		},
		onSuccess: (url) => {
			window.location.href = url;
		},
		onError: () => {
			toast.error("Failed to create session");
		},
	});

	return mutation;
};
