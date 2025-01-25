import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('Middleware executing for path:', pathname)

  const isAuthenticated = request.cookies.has('sessionId')
  console.log('Is authenticated:', isAuthenticated)

  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/register']
  const isPublicPath = publicPaths.includes(pathname)

  if (isAuthenticated) {
    // If authenticated and trying to access any public path (including root), redirect to /chat
    if (isPublicPath) {
      console.log('Authenticated user accessing public path, redirecting to /chat')
      return NextResponse.redirect(new URL('/chat', request.url))
    }
    return NextResponse.next()
  }

  // If not authenticated and trying to access protected paths, redirect to login
  if (!isPublicPath) {
    console.log('Unauthenticated user accessing protected path, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
