import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@canvastra-next-js/auth";

export const protectServer = async () => {
  try {
    const headersList = await headers();
    const headersObj = new Headers();

    headersList.forEach((value, key) => {
      headersObj.set(key, value);
    });

    const session = await auth.api.getSession({
      headers: headersObj,
    });

    if (!session?.user) {
      redirect("/sign-in" as any);
    }

    return session;
  } catch (error) {
    // If auth fails (database not connected, etc.), redirect to sign-in
    // Don't log in production to avoid exposing errors
    if (process.env.NODE_ENV === "development") {
      console.error("Auth error:", error);
    }
    // Use redirect which throws internally in Next.js - this is expected behavior
    redirect("/sign-in" as any);
  }
};
