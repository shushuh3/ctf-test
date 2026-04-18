// Доменные ошибки. Бросаются из сервис-слоя, перехватываются transport'ом
// и маппятся в HTTP-ответы через `mapDomainError`.
export class DomainError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super('NOT_FOUND', id ? `${entity} ${id} not found` : `${entity} not found`);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(action: string) {
    super('FORBIDDEN', `action not allowed: ${action}`);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('UNAUTHORIZED', 'not authenticated');
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends DomainError {
  readonly fieldErrors?: Record<string, string[]>;
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super('VALIDATION', message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super('CONFLICT', message);
    this.name = 'ConflictError';
  }
}
