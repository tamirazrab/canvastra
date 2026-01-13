"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { toast } from "sonner";
import ButtonVm from "@/app/components/button/button.i-vm";
import { BaseVM } from "reactvvm";

export default class BillingButtonVM extends BaseVM<ButtonVm> {
  useVM(): ButtonVm {
    const [isPending, setIsPending] = useState(false);

    const handleBilling = async () => {
      setIsPending(true);
      try {
        const response = await (client as any).api.subscriptions.billing.$post();

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const data = await response.json();
        window.location.href = data.data;
      } catch (err) {
        toast.error("Failed to create session");
      } finally {
        setIsPending(false);
      }
    };

    return {
      props: {
        title: isPending ? "Processing..." : "Manage Billing",
        isDisable: isPending,
      },
      onClick: handleBilling,
    };
  }
}
