export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.eventId = eventId || crypto.randomUUID();
    this.occurredOn = new Date();
  }

  public abstract getEventName(): string;
}

