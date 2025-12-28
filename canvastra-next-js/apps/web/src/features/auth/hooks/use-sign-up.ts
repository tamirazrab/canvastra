import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type SignUpInput = {
	name: string;
	email: string;
	password: string;
};

export const useSignUp = () => {
	const mutation = useMutation({
		mutationFn: async (input: SignUpInput) => {
			const result = await authClient.signUp.email({
				email: input.email,
				password: input.password,
				name: input.name,
			});
			return result;
		},
		onSuccess: () => {
			toast.success("User created");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Something went wrong");
		},
	});

	return mutation;
};
