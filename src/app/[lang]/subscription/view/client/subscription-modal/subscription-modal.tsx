"use client";

import { useMemo } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import CheckoutButtonVM from "@/app/[lang]/subscription/vm/checkout-button-vm";
import SubscriptionModalVM from "@/app/[lang]/subscription/vm/subscription-modal-vm";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";
import { Button } from "@/app/components/ui/button";

export function SubscriptionModal() {
  const checkoutVM = useMemo(() => new CheckoutButtonVM(), []);
  const checkoutState = checkoutVM.useVM();
  const modalVM = useMemo(() => new SubscriptionModalVM(), []);
  const modalState = modalVM.useVM();

  return (
    <Dialog open={modalState.isOpen} onOpenChange={modalState.onClose}>
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
            <CheckCircle2 className="size-5 mr-2 fill-blue-500 text-white" />
            <p className="text-sm text-muted-foreground">Unlimited projects</p>
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="size-5 mr-2 fill-blue-500 text-white" />
            <p className="text-sm text-muted-foreground">Unlimited templates</p>
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="size-5 mr-2 fill-blue-500 text-white" />
            <p className="text-sm text-muted-foreground">
              AI Background removal
            </p>
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="size-5 mr-2 fill-blue-500 text-white" />
            <p className="text-sm text-muted-foreground">AI Image generation</p>
          </li>
        </ul>
        <DialogFooter className="pt-2 mt-4 gap-y-2">
          <Button
            className="w-full"
            onClick={checkoutState.onClick}
            disabled={checkoutState.props.isDisable}
          >
            Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
