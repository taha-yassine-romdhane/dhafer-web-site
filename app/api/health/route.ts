import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setCorsHeaders } from '@/lib/cors'

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

/**
 * Health check endpoint for Docker and monitoring
 * This endpoint verifies that the application is running
 */
export async function GET(request: NextRequest) {
  console.log('Health check endpoint called');
  
  try {
    // First try a simple response without database check
    const simpleResponse = NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Service is running',
      server: process.env.HOSTNAME || 'unknown'
    });
    
    return setCorsHeaders(simpleResponse);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Service encountered an error',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : String(error)
      },
      { status: 500 }
    );
    
    return setCorsHeaders(errorResponse);
  }
}
