import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic session cookie check for Edge routing
  const session = request.cookies.get('firebase-session');

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isProtectedPath = request.nextUrl.pathname.startsWith('/account') || isAdminPath;

  if (isProtectedPath) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check 1: Edge Middleware Admin Check
    if (isAdminPath) {
      try {
        const decodedEmail = atob(session.value);
        if (decodedEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (e) {
        return NextResponse.redirect(new URL('/', request.url));
      }
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
