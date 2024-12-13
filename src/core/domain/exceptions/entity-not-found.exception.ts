import { DomainException } from "./domain-exception";

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(
      `${entityName} with identifier '${identifier}' not found`,
      "ENTITY_NOT_FOUND"
    );
  }
}

