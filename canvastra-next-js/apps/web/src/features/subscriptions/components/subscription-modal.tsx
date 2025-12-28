"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

export const SubscriptionModal = () => {
	const mutation = useCheckout();
	const { isOpen, onClose } = useSubscriptionModal();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader className="flex items-center space-y-4">
					<Image src="/logo.svg" alt="Logo" width={36} height={36} />
					<DialogTitle className="text-center">
						Upgrade to a paid plan
					</DialogTitle>
					<DialogDescription className="text-center">
						Upgrade to a paid plan to unlock more features
					</DialogDescription>
				</DialogHeader>
				<Separator />
				<ul className="space-y-2">
					<li className="flex items-center">
						<CheckCircle2 className="mr-2 size-5 fill-blue-500 text-white" />
						<p className="text-muted-foreground text-sm">Unlimited projects</p>
					</li>
					<li className="flex items-center">
						<CheckCircle2 className="mr-2 size-5 fill-blue-500 text-white" />
						<p className="text-muted-foreground text-sm">Unlimited templates</p>
					</li>
					<li className="flex items-center">
						<CheckCircle2 className="mr-2 size-5 fill-blue-500 text-white" />
						<p className="text-muted-foreground text-sm">
							AI Background removal
						</p>
					</li>
					<li className="flex items-center">
						<CheckCircle2 className="mr-2 size-5 fill-blue-500 text-white" />
						<p className="text-muted-foreground text-sm">AI Image generation</p>
					</li>
				</ul>
				<DialogFooter className="mt-4 gap-y-2 pt-2">
					<Button
						className="w-full"
						onClick={() => mutation.mutate()}
						disabled={mutation.isPending}
					>
						Upgrade
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
