import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setCorsHeaders } from './lib/cors';

export async function middleware(request: NextRequest) {
  // Log the request for debugging
  console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`);

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
  }

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/api',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath)
  );

  // If it's a public path, allow the request to proceed
  if (isPublicPath) {
    const response = NextResponse.next();
    return setCorsHeaders(response);
  }

  // For protected routes, check for a valid token
  try {
    // Get the JWT token from the request
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return setCorsHeaders(
        NextResponse.json(
          { error: 'Authentication token is required' },
          { status: 401 }
        )
      );
    }

    // Continue to the protected route
    const response = NextResponse.next();
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error in middleware:', error);
    
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/api/:path*',
  ],
};