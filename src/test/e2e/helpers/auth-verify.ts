import { testDb } from "@/test/e2e/setup/db-setup";
import { accounts } from "@/bootstrap/boundaries/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Verify that an account exists in the database with the structure Better Auth expects.
 * Better Auth queries accounts with:
 * - providerId: "credential"
 * - accountId: email (the email address)
 */
export async function verifyAccountExists(
  email: string,
  maxRetries: number = 5,
): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const account = await testDb
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerId, "credential"),
            eq(accounts.accountId, email),
          ),
        )
        .limit(1);

      if (account.length > 0 && account[0].password) {
        return true;
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
      }
    } catch (error) {
      console.warn(
        `Account verification attempt ${attempt + 1}/${maxRetries} failed:`,
        error,
      );
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }

  return false;
}

/**
 * Get account details for debugging.
 */
export async function getAccountDetails(email: string): Promise<{
  found: boolean;
  accountId?: string;
  providerId?: string;
  userId?: string;
  hasPassword: boolean;
}> {
  try {
    const account = await testDb
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.providerId, "credential"),
          eq(accounts.accountId, email),
        ),
      )
      .limit(1);

    if (account.length === 0) {
      return { found: false, hasPassword: false };
    }

    return {
      found: true,
      accountId: account[0].accountId,
      providerId: account[0].providerId,
      userId: account[0].userId,
      hasPassword: !!account[0].password,
    };
  } catch (error) {
    console.error("Error getting account details:", error);
    return { found: false, hasPassword: false };
  }
}

