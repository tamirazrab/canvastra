"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { getSubscriptionAction } from "@/app/[lang]/subscription/actions/subscription-actions";
import checkIsActiveUseCase from "@/feature/core/subscription/domain/usecase/check-is-active.usecase";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";
import SubscriptionModalVM from "./subscription-modal-vm";

export type PaywallVm = {
  isActive: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  shouldBlock: boolean;
  triggerPaywall: () => void;
};

export default class PaywallVM {
  useVM(): PaywallVm {
    const params = useParams();
    const lang = (params.lang as string) || "en";
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const subscriptionModalVM = useMemo(() => new SubscriptionModalVM(), []);
    const subscriptionModalState = subscriptionModalVM.useVM();

    useEffect(() => {
      const fetchSubscription = async () => {
        try {
          const result = await getSubscriptionAction(lang);

          if (!result.success || !result.data) {
            setSubscription(null);
            return;
          }

          setSubscription(result.data);
        } catch {
          setSubscription(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubscription();
    }, [lang]);

    const isActive = checkIsActiveUseCase(subscription);
    const shouldBlock = isLoading || !isActive;

    const triggerPaywall = () => {
      subscriptionModalState.onOpen();
    };

    return {
      isActive,
      isLoading,
      subscription,
      shouldBlock,
      triggerPaywall,
    };
  }
}
