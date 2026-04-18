import { NextResponse, type NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { requireAction, requireSession } from '@/core/rbac/require';
import type { Action } from '@/core/rbac/permissions';
import { mapDomainError } from './errors';

export type AuthContext<Params = Record<string, string | string[]>> = {
  session: Session;
  params: Params;
};

export type AuthedHandler<Params = Record<string, string | string[]>> = (
  req: NextRequest,
  ctx: AuthContext<Params>,
) => Promise<NextResponse> | NextResponse;

type WithAuthOptions = {
  // Если задан — проверяется право на это действие.
  // Если не задан — достаточно быть аутентифицированным.
  action?: Action;
};

/**
 * Обёртка над route handler'ом: проверяет сессию и (опционально) право,
 * ловит доменные ошибки и маппит в HTTP.
 *
 * Next.js передаёт `{ params: Promise<...> }` вторым аргументом в App Router (v15+).
 * Мы его разворачиваем и передаём plain-объект в ctx.
 */
export function withAuth<Params extends Record<string, string | string[]> = Record<string, never>>(
  options: WithAuthOptions,
  handler: AuthedHandler<Params>,
): (req: NextRequest, nextCtx: { params: Promise<Params> }) => Promise<NextResponse> {
  return async (req, nextCtx) => {
    try {
      const session = options.action ? await requireAction(options.action) : await requireSession();
      const params = (await nextCtx.params) ?? ({} as Params);
      return await handler(req, { session, params });
    } catch (err) {
      return mapDomainError(err);
    }
  };
}
