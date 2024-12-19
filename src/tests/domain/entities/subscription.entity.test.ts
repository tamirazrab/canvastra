import { describe, it, expect, beforeEach } from "vitest";
import { Subscription } from "@/core/domain/entities";

describe("Subscription", () => {
  const createSubscription = (overrides?: Partial<Parameters<typeof Subscription.prototype.constructor>[0]>) => {
    return new Subscription({
      id: "1",
      userId: "user1",
      subscriptionId: "sub_123",
      customerId: "cus_123",
      priceId: "price_123",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ...overrides,
    });
  };

  it("should create a subscription", () => {
    const subscription = createSubscription();

    expect(subscription.id).toBe("1");
    expect(subscription.userId).toBe("user1");
    expect(subscription.subscriptionId).toBe("sub_123");
    expect(subscription.status).toBe("active");
  });

  it("should check if subscription is active", () => {
    const activeSubscription = createSubscription({ status: "active" });
    const trialingSubscription = createSubscription({ status: "trialing" });
    const canceledSubscription = createSubscription({ status: "canceled" });

    expect(activeSubscription.isActive()).toBe(true);
    expect(trialingSubscription.isActive()).toBe(true);
    expect(canceledSubscription.isActive()).toBe(false);
  });

  it("should check if subscription is expired", () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activeSubscription = createSubscription({ currentPeriodEnd: futureDate });
    const expiredSubscription = createSubscription({ currentPeriodEnd: pastDate });
    const noEndDateSubscription = createSubscription({ currentPeriodEnd: null });

    expect(activeSubscription.isExpired()).toBe(false);
    expect(expiredSubscription.isExpired()).toBe(true);
    expect(noEndDateSubscription.isExpired()).toBe(false);
  });

  it("should check if belongs to user", () => {
    const subscription = createSubscription({ userId: "user1" });

    expect(subscription.belongsTo("user1")).toBe(true);
    expect(subscription.belongsTo("user2")).toBe(false);
  });

  it("should update status", () => {
    const subscription = createSubscription({ status: "active" });
    const updated = subscription.updateStatus("canceled");

    expect(updated.status).toBe("canceled");
    expect(updated.id).toBe(subscription.id);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(subscription.updatedAt.getTime());
  });

  it("should update period end", () => {
    const subscription = createSubscription();
    const newEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const updated = subscription.updatePeriodEnd(newEndDate);

    expect(updated.currentPeriodEnd).toEqual(newEndDate);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(subscription.updatedAt.getTime());
  });
});

