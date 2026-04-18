import type { Session } from 'next-auth';
import { auth } from '@/core/auth/auth';
import { ForbiddenError, UnauthorizedError } from '@/core/errors';
import { canDo, type Action } from './permissions';

/**
 * Возвращает активную сессию или кидает UnauthorizedError.
 * Используется в server components / server actions / API handlers.
 */
export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Проверяет что у сессии есть право на действие, иначе бросает ForbiddenError.
 */
export async function requireAction(action: Action): Promise<Session> {
  const session = await requireSession();
  if (!canDo(session.user.role, action)) {
    throw new ForbiddenError(action);
  }
  return session;
}

// sessionCan перенесён в ./permissions (pure, без зависимости от auth()).
export { sessionCan } from './permissions';
