"use client";

import { SuccessModal } from "@/app/[lang]/subscription/view/client/success-modal/success-modal";
import { FailModal } from "@/app/[lang]/subscription/view/client/fail-modal/fail-modal";
import { SubscriptionModal } from "@/app/[lang]/subscription/view/client/subscription-modal/subscription-modal";

export function Modals() {
  return (
    <>
      <FailModal />
      <SuccessModal />
      <SubscriptionModal />
    </>
  );
}
