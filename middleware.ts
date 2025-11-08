import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  const AUTH_ROUTES = ['/login', '/register']
  const PROTECTED_ROUTES = ['/dashboard']

  const isAuthPage = AUTH_ROUTES.some(route => pathname.startsWith(route))
  const isProtectedPage = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isAuthPage && token) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (!token && isProtectedPage) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}
