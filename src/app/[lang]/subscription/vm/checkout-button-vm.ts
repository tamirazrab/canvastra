"use client";

import { useState } from "react";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import ButtonVm from "@/app/components/button/button.i-vm";
import { BaseVM } from "reactvvm";

export default class CheckoutButtonVM extends BaseVM<ButtonVm> {
  useVM(): ButtonVm {
    const [isPending, setIsPending] = useState(false);

    const handleCheckout = async () => {
      setIsPending(true);
      try {
        const response = await (client as any).api.subscriptions.checkout.$post();

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const data = await response.json();
        window.location.href = data.data;
      } catch {
        toast.error("Failed to create session");
      } finally {
        setIsPending(false);
      }
    };

    return {
      props: {
        title: isPending ? "Processing..." : "Subscribe",
        isDisable: isPending,
      },
      onClick: handleCheckout,
    };
  }
}
