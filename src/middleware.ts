import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('Middleware executing for path:', pathname)

  const isAuthenticated = request.cookies.has('sessionId')
  console.log('Is authenticated:', isAuthenticated)

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat/:path*', '/profile/:path*'],
}
