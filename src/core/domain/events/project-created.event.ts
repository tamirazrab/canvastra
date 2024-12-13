import { DomainEvent } from "./domain-event";
import { Project } from "../entities";

export class ProjectCreatedEvent extends DomainEvent {
  constructor(public readonly project: Project) {
    super();
  }

  public getEventName(): string {
    return "project.created";
  }
}

