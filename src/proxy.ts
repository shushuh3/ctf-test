// Next.js 16 переименовал middleware.ts в proxy.ts (рантайм nodejs).
// Здесь явно реализуем логику: неаутентифицированных пускаем только на /login и /api/auth/*,
// остальных — редирект на /login. RBAC по ролям проверяется точечно в API-обёртках / страницах.
import { NextResponse } from 'next/server';
import { auth } from '@/core/auth/auth';

export default auth(function proxy(req) {
  const { nextUrl, auth: session } = req;
  const { pathname } = nextUrl;

  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/api/auth');
  if (isPublic) return NextResponse.next();

  if (!session) {
    const url = nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
