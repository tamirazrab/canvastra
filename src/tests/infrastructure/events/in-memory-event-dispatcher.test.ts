import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryEventDispatcher } from "@/infrastructure/events";
import { DomainEvent, EventHandler } from "@/core/domain/events";
import { ProjectCreatedEvent } from "@/core/domain/events";
import { Project } from "@/core/domain/entities";

describe("InMemoryEventDispatcher", () => {
  let dispatcher: InMemoryEventDispatcher;

  beforeEach(() => {
    dispatcher = new InMemoryEventDispatcher();
  });

  it("should register and dispatch events", async () => {
    const project = new Project({
      id: "1",
      name: "Test",
      userId: "user1",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    const event = new ProjectCreatedEvent(project);
    const handler: EventHandler<ProjectCreatedEvent> = {
      handle: vi.fn(),
    };

    dispatcher.register("project.created", handler);
    await dispatcher.dispatch(event);

    expect(handler.handle).toHaveBeenCalledWith(event);
  });

  it("should handle multiple handlers for same event", async () => {
    const project = new Project({
      id: "1",
      name: "Test",
      userId: "user1",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    const event = new ProjectCreatedEvent(project);
    const handler1: EventHandler<ProjectCreatedEvent> = {
      handle: vi.fn(),
    };
    const handler2: EventHandler<ProjectCreatedEvent> = {
      handle: vi.fn(),
    };

    dispatcher.register("project.created", handler1);
    dispatcher.register("project.created", handler2);
    await dispatcher.dispatch(event);

    expect(handler1.handle).toHaveBeenCalledWith(event);
    expect(handler2.handle).toHaveBeenCalledWith(event);
  });

  it("should unregister handlers", async () => {
    const project = new Project({
      id: "1",
      name: "Test",
      userId: "user1",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    const event = new ProjectCreatedEvent(project);
    const handler: EventHandler<ProjectCreatedEvent> = {
      handle: vi.fn(),
    };

    dispatcher.register("project.created", handler);
    dispatcher.unregister("project.created", handler);
    await dispatcher.dispatch(event);

    expect(handler.handle).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const project = new Project({
      id: "1",
      name: "Test",
      userId: "user1",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    const event = new ProjectCreatedEvent(project);
    const handler: EventHandler<ProjectCreatedEvent> = {
      handle: vi.fn(() => {
        throw new Error("Handler error");
      }),
    };

    dispatcher.register("project.created", handler);

    // Should not throw
    await expect(dispatcher.dispatch(event)).resolves.not.toThrow();
  });
});

