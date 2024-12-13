import { DomainEvent } from "./domain-event";

export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void> | void;
}

export interface EventDispatcher {
  register<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void;
  unregister<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void;
  dispatch(event: DomainEvent): Promise<void>;
}

