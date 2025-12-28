import { BaseEntity } from "./base.entity";

export interface SubscriptionProps {
	id: string;
	userId: string;
	subscriptionId: string;
	customerId: string;
	priceId: string;
	status: string;
	currentPeriodEnd: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export class Subscription extends BaseEntity {
	public readonly userId: string;
	public readonly subscriptionId: string;
	public readonly customerId: string;
	public readonly priceId: string;
	public readonly status: string;
	public readonly currentPeriodEnd: Date | null;

	constructor(props: SubscriptionProps) {
		super(props.id, props.createdAt, props.updatedAt);
		this.userId = props.userId;
		this.subscriptionId = props.subscriptionId;
		this.customerId = props.customerId;
		this.priceId = props.priceId;
		this.status = props.status;
		this.currentPeriodEnd = props.currentPeriodEnd;
	}

	public isActive(): boolean {
		const activeStatuses = ["active", "trialing"];
		return activeStatuses.includes(this.status.toLowerCase());
	}

	public isExpired(): boolean {
		if (!this.currentPeriodEnd) {
			return false;
		}
		return new Date() > this.currentPeriodEnd;
	}

	public belongsTo(userId: string): boolean {
		return this.userId === userId;
	}

	public updateStatus(status: string): Subscription {
		return new Subscription({
			...this,
			status,
			updatedAt: new Date(),
		});
	}

	public updatePeriodEnd(currentPeriodEnd: Date): Subscription {
		return new Subscription({
			...this,
			currentPeriodEnd,
			updatedAt: new Date(),
		});
	}
}
