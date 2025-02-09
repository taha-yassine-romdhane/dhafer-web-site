import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwtToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  // List of protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/orders']

  // Check if the requested path is protected
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login if no token exists
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify token
      const payload = await verifyJwtToken(token.value)
      if (!payload) {
        // Redirect to login if token is invalid
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      // Redirect to login if token verification fails
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // List of auth routes (login/signup)
  const authRoutes = ['/login', '/signup']

  // Redirect to dashboard if user is already logged in and trying to access auth routes
  if (authRoutes.includes(request.nextUrl.pathname) && token) {
    try {
      const payload = await verifyJwtToken(token.value)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // If token is invalid, allow access to auth routes
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/login',
    '/signup'
  ]
}