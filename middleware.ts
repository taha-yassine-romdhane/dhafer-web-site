import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwtToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  // List of protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/orders']

  // List of auth routes (login/signup)
  const authRoutes = ['/login', '/signup']

  // Check if the requested path is protected
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login if no token exists
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token') // Clear any invalid token
      return response
    }

    try {
      // Verify token
      const payload = await verifyJwtToken(token.value)
      if (!payload) {
        // Redirect to login if token is invalid
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('token')
        return response
      }
      return NextResponse.next()
    } catch (error) {
      // Redirect to login if token verification fails
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // Handle auth routes (login/signup)
  if (authRoutes.includes(request.nextUrl.pathname)) {
    if (token) {
      try {
        const payload = await verifyJwtToken(token.value)
        if (payload) {
          // If user is already logged in and tries to access auth routes,
          // redirect them to home page
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (error) {
        // If token is invalid, clear it and allow access to auth routes
        const response = NextResponse.next()
        response.cookies.delete('token')
        return response
      }
    }
    // If no token, allow access to auth routes
    return NextResponse.next()
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