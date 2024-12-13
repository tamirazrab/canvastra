import { DomainEvent } from "./domain-event";
import { Subscription } from "../entities";

export class SubscriptionActivatedEvent extends DomainEvent {
  constructor(public readonly subscription: Subscription) {
    super();
  }

  public getEventName(): string {
    return "subscription.activated";
  }
}

