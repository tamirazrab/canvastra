"use client";

import { useMemo } from "react";
import { CreditCard, Crown, Loader, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import PaywallVM from "@/app/[lang]/subscription/vm/paywall-vm";
import BillingButtonVM from "@/app/[lang]/subscription/vm/billing-button-vm";

export function UserButton() {
  const paywallVM = useMemo(() => new PaywallVM(), []);
  const paywallState = paywallVM.useVM();
  const billingVM = useMemo(() => new BillingButtonVM(), []);
  const billingState = billingVM.useVM();
  const { data: session, isPending, error } = authClient.useSession();

  const onClick = () => {
    if (!paywallState.isActive && !paywallState.isLoading) {
      billingState.onClick();
    }
  };

  if (isPending) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  // Log error in development for debugging
  if (error && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error("UserButton session error:", error);
  }

  if (!session || !session.user) {
    // Show a fallback button if we're authenticated but session isn't loading
    // This allows users to still sign out
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none">
          <Avatar className="size-10 hover:opacity-75 transition">
            <AvatarFallback className="bg-muted font-medium text-muted-foreground flex items-center justify-center">
              ?
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem
            className="h-10"
            onClick={() => authClient.signOut()}
          >
            <LogOut className="size-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const name = session.user.name || session.user.email || "User";
  const imageUrl = session.user.image;
  const initials =
    name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        {paywallState.isActive && !paywallState.isLoading && (
          <div className="absolute -top-1 -left-1 z-10 flex items-center justify-center">
            <div className="rounded-full bg-white flex items-center justify-center p-1 drop-shadow-sm">
              <Crown className="size-3 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}
        <Avatar className="size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="bg-blue-500 font-medium text-white flex items-center justify-center">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          disabled={billingState.props.isDisable}
          onClick={onClick}
          className="h-10"
        >
          <CreditCard className="size-4 mr-2" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10" onClick={() => authClient.signOut()}>
          <LogOut className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
