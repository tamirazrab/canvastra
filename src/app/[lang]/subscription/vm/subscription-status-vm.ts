"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { BaseVM } from "reactvvm";

export type SubscriptionStatusVm = {
  subscription: any | null;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  refresh: () => void;
};

export default class SubscriptionStatusVM extends BaseVM<SubscriptionStatusVm> {
  useVM(): SubscriptionStatusVm {
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await (client as any).api.subscriptions.current.$get();

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        const data = await response.json();
        setSubscription(data.data);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchSubscription();
    }, []);

    const refresh = () => {
      fetchSubscription();
    };

    return {
      subscription,
      isLoading,
      isError,
      error,
      refresh,
    };
  }
}
