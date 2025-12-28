import { describe, expect, it } from "vitest";
import { Subscription } from "./subscription.entity";

describe("Subscription Entity", () => {
	const baseSubscriptionData = {
		id: "sub-123",
		userId: "user-123",
		subscriptionId: "stripe-sub-123",
		customerId: "stripe-customer-123",
		priceId: "price-123",
		status: "active",
		currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
	};

	it("should create a subscription with required fields", () => {
		const subscription = new Subscription(baseSubscriptionData);

		expect(subscription.id).toBe("sub-123");
		expect(subscription.userId).toBe("user-123");
		expect(subscription.status).toBe("active");
	});

	it("should check if subscription is active", () => {
		const activeSubscription = new Subscription({
			...baseSubscriptionData,
			status: "active",
		});
		const trialingSubscription = new Subscription({
			...baseSubscriptionData,
			status: "trialing",
		});
		const canceledSubscription = new Subscription({
			...baseSubscriptionData,
			status: "canceled",
		});

		expect(activeSubscription.isActive()).toBe(true);
		expect(trialingSubscription.isActive()).toBe(true);
		expect(canceledSubscription.isActive()).toBe(false);
	});

	it("should check if subscription is expired", () => {
		const activeSubscription = new Subscription({
			...baseSubscriptionData,
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		});
		const expiredSubscription = new Subscription({
			...baseSubscriptionData,
			currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
		});
		const noEndDateSubscription = new Subscription({
			...baseSubscriptionData,
			currentPeriodEnd: null,
		});

		expect(activeSubscription.isExpired()).toBe(false);
		expect(expiredSubscription.isExpired()).toBe(true);
		expect(noEndDateSubscription.isExpired()).toBe(false);
	});

	it("should check if subscription belongs to user", () => {
		const subscription = new Subscription(baseSubscriptionData);

		expect(subscription.belongsTo("user-123")).toBe(true);
		expect(subscription.belongsTo("user-456")).toBe(false);
	});

	it("should update status immutably", () => {
		const subscription = new Subscription(baseSubscriptionData);
		const updated = subscription.updateStatus("canceled");

		expect(updated.status).toBe("canceled");
		expect(updated.id).toBe(subscription.id);
		expect(updated).not.toBe(subscription);
	});

	it("should update period end immutably", () => {
		const subscription = new Subscription(baseSubscriptionData);
		const newEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
		const updated = subscription.updatePeriodEnd(newEndDate);

		expect(updated.currentPeriodEnd).toEqual(newEndDate);
		expect(updated.id).toBe(subscription.id);
		expect(updated).not.toBe(subscription);
	});
});
