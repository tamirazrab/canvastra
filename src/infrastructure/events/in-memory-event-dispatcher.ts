import {
  DomainEvent,
  EventDispatcher,
  EventHandler,
} from "@/core/domain/events";

export class InMemoryEventDispatcher implements EventDispatcher {
  private handlers: Map<string, EventHandler<DomainEvent>[]> = new Map();

  register<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler as EventHandler<DomainEvent>);
  }

  unregister<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler<DomainEvent>);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName();
    const handlers = this.handlers.get(eventName) || [];

    await Promise.all(
      handlers.map((handler) => {
        try {
          return Promise.resolve(handler.handle(event));
        } catch (error) {
          console.error(`Error handling event ${eventName}:`, error);
          return Promise.resolve();
        }
      })
    );
  }
}

