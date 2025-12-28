"use client";

import { CreditCard, Crown, Loader, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBilling } from "@/features/subscriptions/api/use-billing";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { authClient } from "@/lib/auth-client";

export const UserButton = () => {
	const { shouldBlock, triggerPaywall, isLoading } = usePaywall();
	const mutation = useBilling();
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	const onClick = () => {
		if (shouldBlock) {
			triggerPaywall();
			return;
		}

		mutation.mutate();
	};

	if (isPending) {
		return <Loader className="size-4 animate-spin text-muted-foreground" />;
	}

	if (!session?.user) {
		return null;
	}

	const name = session.user.name || "";
	const imageUrl = session.user.image || "";

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger className="relative outline-none">
				{!shouldBlock && !isLoading && (
					<div className="absolute -top-1 -left-1 z-10 flex items-center justify-center">
						<div className="flex items-center justify-center rounded-full bg-white p-1 drop-shadow-sm">
							<Crown className="size-3 fill-yellow-500 text-yellow-500" />
						</div>
					</div>
				)}
				<Avatar className="hover:opcaity-75 size-10 transition">
					<AvatarImage alt={name} src={imageUrl || ""} />
					<AvatarFallback className="flex items-center justify-center bg-blue-500 font-medium text-white">
						{name.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuItem
					disabled={mutation.isPending}
					onClick={onClick}
					className="h-10"
				>
					<CreditCard className="mr-2 size-4" />
					Billing
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="h-10"
					onClick={async () => {
						await authClient.signOut();
						router.push("/sign-in");
						router.refresh();
					}}
				>
					<LogOut className="mr-2 size-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
