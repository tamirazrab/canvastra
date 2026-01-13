"use client";

import { useMemo } from "react";
import { CreditCard, Crown, Home, MessageCircleQuestion } from "lucide-react";
import { usePathname, useParams } from "next/navigation";

import PaywallVM from "@/app/[lang]/subscription/vm/paywall-vm";
import CheckoutButtonVM from "@/app/[lang]/subscription/vm/checkout-button-vm";
import BillingButtonVM from "@/app/[lang]/subscription/vm/billing-button-vm";

import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";

import { SidebarItem } from "../server/sidebar-item";

export function SidebarRoutes() {
  const checkoutVM = useMemo(() => new CheckoutButtonVM(), []);
  const checkoutState = checkoutVM.useVM();
  const billingVM = useMemo(() => new BillingButtonVM(), []);
  const billingState = billingVM.useVM();
  const paywallVM = useMemo(() => new PaywallVM(), []);
  const paywallState = paywallVM.useVM();

  const pathname = usePathname();
  const params = useParams();
  const lang = (params.lang as string) || "en";

  const onClick = () => {
    if (!paywallState.isActive && !paywallState.isLoading) {
      billingState.onClick();
    }
  };

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      {!paywallState.isActive && !paywallState.isLoading && (
        <>
          <div className="px-3">
            <Button
              onClick={checkoutState.onClick}
              disabled={checkoutState.props.isDisable}
              className="w-full rounded-xl border-none hover:bg-white hover:opacity-75 transition"
              variant="outline"
              size="lg"
            >
              <Crown className="mr-2 size-4 fill-yellow-500 text-yellow-500" />
              Upgrade to Pro
            </Button>
          </div>
          <div className="px-3">
            <Separator />
          </div>
        </>
      )}
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem
          href={`/${lang}/editor`}
          icon={Home}
          label="Home"
          isActive={pathname === `/${lang}/editor`}
        />
      </ul>
      <div className="px-3">
        <Separator />
      </div>
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem
          href={pathname}
          icon={CreditCard}
          label="Billing"
          onClick={onClick}
        />
        <SidebarItem
          href="mailto:support@example.com"
          icon={MessageCircleQuestion}
          label="Get Help"
        />
      </ul>
    </div>
  );
}
