"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import SuccessModalVM from "@/app/[lang]/subscription/vm/success-modal-vm";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

export function SuccessModal() {
  const router = useRouter();
  const modalVM = useMemo(() => new SuccessModalVM(), []);
  const modalState = modalVM.useVM();

  const handleClose = () => {
    router.replace("/");
    modalState.onClose();
  };

  return (
    <Dialog open={modalState.isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex items-center space-y-4">
          <Image src="/logo.svg" alt="Logo" width={36} height={36} />
          <DialogTitle className="text-center">
            Subscription successfull!
          </DialogTitle>
          <DialogDescription className="text-center">
            You have successfully subscribed to our service
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2 mt-4 gap-y-2">
          <Button className="w-full" onClick={handleClose}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
