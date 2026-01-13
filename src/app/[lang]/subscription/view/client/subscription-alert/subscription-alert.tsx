"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import FailModalVM from "@/app/[lang]/subscription/vm/fail-modal-vm";
import SuccessModalVM from "@/app/[lang]/subscription/vm/success-modal-vm";

export function SubscriptionAlert() {
  const params = useSearchParams();
  const failModalVM = useMemo(() => new FailModalVM(), []);
  const failModalState = failModalVM.useVM();
  const successModalVM = useMemo(() => new SuccessModalVM(), []);
  const successModalState = successModalVM.useVM();

  const canceled = params.get("canceled");
  const success = params.get("success");

  useEffect(() => {
    if (canceled) {
      failModalState.onOpen();
    }

    if (success) {
      successModalState.onOpen();
    }
  }, [canceled, success, failModalState, successModalState]);

  return null;
}
