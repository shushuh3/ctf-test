import { NextResponse, type NextRequest } from 'next/server';
import type { ZodType, z } from 'zod';
import { ValidationError } from '@/core/errors';
import { mapDomainError } from './errors';

type Schemas<Body, Query> = {
  body?: ZodType<Body>;
  query?: ZodType<Query>;
};

type ValidatedData<Body, Query> = {
  body: Body;
  query: Query;
};

type NextCtx<Params> = { params: Promise<Params> };

export type ValidatedHandler<
  Body,
  Query,
  Params extends Record<string, string | string[]>,
  ExtraCtx,
> = (
  req: NextRequest,
  ctx: ExtraCtx & { params: Params; valid: ValidatedData<Body, Query> },
) => Promise<NextResponse> | NextResponse;

/**
 * Валидация request body (JSON) и query-параметров через Zod.
 * Не подменяет `withAuth` — используется ПОСЛЕ него, либо самостоятельно.
 *
 * Пример: `withAuth({ action }, withValidation({ body, query }, async (req, ctx) => ...))`
 */
export function withValidation<
  Body = unknown,
  Query = unknown,
  Params extends Record<string, string | string[]> = Record<string, never>,
  ExtraCtx extends object = object,
>(
  schemas: Schemas<Body, Query>,
  handler: ValidatedHandler<Body, Query, Params, ExtraCtx>,
): (req: NextRequest, ctx: ExtraCtx & NextCtx<Params>) => Promise<NextResponse> {
  return async (req, ctx) => {
    try {
      let body: Body = undefined as Body;
      if (schemas.body) {
        const raw = await readJsonSafe(req);
        const parsed = schemas.body.safeParse(raw);
        if (!parsed.success) {
          const fieldErrors = (parsed.error as z.ZodError).flatten().fieldErrors as Record<
            string,
            string[]
          >;
          throw new ValidationError('Invalid request body', fieldErrors);
        }
        body = parsed.data;
      }

      let query: Query = undefined as Query;
      if (schemas.query) {
        const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
        const parsed = schemas.query.safeParse(raw);
        if (!parsed.success) {
          const fieldErrors = (parsed.error as z.ZodError).flatten().fieldErrors as Record<
            string,
            string[]
          >;
          throw new ValidationError('Invalid query parameters', fieldErrors);
        }
        query = parsed.data;
      }

      const params = (await ctx.params) ?? ({} as Params);
      return await handler(req, {
        ...(ctx as ExtraCtx),
        params,
        valid: { body, query },
      });
    } catch (err) {
      return mapDomainError(err);
    }
  };
}

async function readJsonSafe(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
