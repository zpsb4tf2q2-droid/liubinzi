import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/protected')) {
    const session = request.cookies.get('session');
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected'],
};
