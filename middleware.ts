import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwtToken } from '@/lib/auth'

// Debug function to log middleware execution
function logMiddlewareInfo(request: NextRequest, message: string, data?: any) {
  console.log(`[Middleware Debug] ${message}`, {
    path: request.nextUrl.pathname,
    ...(data && { data })
  });
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  logMiddlewareInfo(request, 'Middleware executing for path');
  
  // IMPORTANT: For login and signup pages, bypass most of the middleware logic
  // This ensures these pages are always accessible
  if (path === '/login' || path === '/signup') {
    logMiddlewareInfo(request, 'Auth page detected, bypassing middleware checks');
    return NextResponse.next();
  }
  
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  
  logMiddlewareInfo(request, 'Token status', { exists: !!token });
  
  // Define routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/orders']
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  logMiddlewareInfo(request, 'Route classification', { 
    isProtectedRoute
  });
  
  // If the path is not protected, allow access
  if (!isProtectedRoute) {
    logMiddlewareInfo(request, 'Path is not protected, allowing access');
    return NextResponse.next()
  }
  
  // For protected routes: verify token and redirect to login if invalid
  if (isProtectedRoute) {
    logMiddlewareInfo(request, 'Handling protected route');
    
    // If no token exists, redirect to login
    if (!token) {
      logMiddlewareInfo(request, 'No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      logMiddlewareInfo(request, 'Verifying token for protected route');
      const payload = await verifyJwtToken(token)
      
      if (payload) {
        logMiddlewareInfo(request, 'Token is valid, allowing access to protected route');
        return NextResponse.next()
      } else {
        logMiddlewareInfo(request, 'Token is invalid, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (err) {
      const error = err as Error;
      logMiddlewareInfo(request, 'Token verification failed', { error: error.message });
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  logMiddlewareInfo(request, 'Default fallback, allowing access');
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