import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/core/errors';
import { logger } from '@/core/logger/pino';

type ErrorPayload = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export function mapDomainError(err: unknown): NextResponse<ErrorPayload> {
  if (err instanceof ZodError) {
    return NextResponse.json<ErrorPayload>(
      {
        code: 'VALIDATION',
        message: 'Invalid request payload',
        fieldErrors: (err as ZodError).flatten().fieldErrors as Record<string, string[]>,
      },
      { status: 400 },
    );
  }

  if (err instanceof ValidationError) {
    return NextResponse.json<ErrorPayload>(
      { code: err.code, message: err.message, fieldErrors: err.fieldErrors },
      { status: 400 },
    );
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json<ErrorPayload>(
      { code: err.code, message: err.message },
      { status: 404 },
    );
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json<ErrorPayload>(
      { code: err.code, message: err.message },
      { status: 403 },
    );
  }
  if (err instanceof UnauthorizedError) {
    return NextResponse.json<ErrorPayload>(
      { code: err.code, message: err.message },
      { status: 401 },
    );
  }
  if (err instanceof ConflictError) {
    return NextResponse.json<ErrorPayload>(
      { code: err.code, message: err.message },
      { status: 409 },
    );
  }
  if (err instanceof DomainError) {
    return NextResponse.json<ErrorPayload>(
      { code: err.code, message: err.message },
      { status: 400 },
    );
  }

  logger.error({ err }, 'unhandled error in route handler');
  return NextResponse.json<ErrorPayload>(
    { code: 'INTERNAL', message: 'Internal server error' },
    { status: 500 },
  );
}
