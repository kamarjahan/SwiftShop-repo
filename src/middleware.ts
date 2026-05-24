import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic session cookie check for Edge routing
  const session = request.cookies.get('firebase-session');

  const isProtectedPath = request.nextUrl.pathname.startsWith('/account') || request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedPath) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect away from auth pages if already authenticated
  if (request.nextUrl.pathname.startsWith('/login')) {
      if (session) {
          return NextResponse.redirect(new URL('/account', request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/login'],
};
