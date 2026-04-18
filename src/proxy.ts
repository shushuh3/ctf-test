// Next.js 16 переименовал middleware.ts в proxy.ts (рантайм nodejs).
// Защищает только HTML-страницы: unauth → редирект на /login.
// API-роуты защищаются своей обёрткой `withAuth` (401 JSON для REST-клиентов),
// Auth.js-роут `/api/auth/*` исключён matcher'ом.
import { NextResponse } from 'next/server';
import { auth } from '@/core/auth/auth';

export default auth(function proxy(req) {
  if (req.auth) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('callbackUrl', req.nextUrl.pathname);
  return NextResponse.redirect(url);
});

export const config = {
  // Всё, кроме api/*, статики, _next/*, /login и /docs (Swagger UI публичный).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|docs).*)'],
};
