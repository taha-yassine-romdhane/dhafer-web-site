import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper method to set CORS headers
export function setCorsHeaders(response: NextResponse) {
  // Allow requests from any origin
  response.headers.set('Access-Control-Allow-Origin', '*');
  
  // Allow specific methods
  response.headers.set(
    'Access-Control-Allow-Methods', 
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  
  // Allow specific headers
  response.headers.set(
    'Access-Control-Allow-Headers', 
    'Content-Type, Authorization, X-Requested-With'
  );
  
  // Allow credentials
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Set max age for preflight requests
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Middleware function to handle CORS preflight requests
export function handleCors(req: NextRequest) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return setCorsHeaders(response);
  }
  
  // For regular requests, continue processing
  return null;
}
