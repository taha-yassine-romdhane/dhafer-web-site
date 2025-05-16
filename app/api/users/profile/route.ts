import { NextResponse, NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function GET(request: NextRequest) {
  try {
    console.log('Profile endpoint called');
    
    // Get token from Authorization header (sent from localStorage)
    const authHeader = request.headers.get('Authorization') || '';
    console.log('Auth header present:', !!authHeader);
    
    let user = null;
    
    // Extract and verify the token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      user = await verifyJwtToken(token);
      console.log('User from auth header:', user ? `found (${user.email})` : 'not found');
    }
    
    // No valid authentication found
    if (!user || !user.userId) {
      console.error('No valid authentication found');
      return setCorsHeaders(
        NextResponse.json(
          { 
            error: 'Authentication required. Please log in again.', 
            code: 'NO_AUTH',
            redirect: '/login?redirect=/profile'
          },
          { status: 401 }
        )
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        id: user.userId
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isSubscribed: true,
        fidelityPoints: true
      }
    });

    return setCorsHeaders(NextResponse.json(userProfile));
  } catch (error) {
    console.error('Error fetching profile:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Server error', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Profile update endpoint called');
    
    // Get token from Authorization header (sent from localStorage)
    const authHeader = request.headers.get('Authorization') || '';
    console.log('Auth header present:', !!authHeader);
    
    let user = null;
    
    // Extract and verify the token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      user = await verifyJwtToken(token);
      console.log('User from auth header:', user ? `found (${user.email})` : 'not found');
    }
    
    // No valid authentication found
    if (!user || !user.userId) {
      console.error('No valid authentication found');
      return setCorsHeaders(
        NextResponse.json(
          { 
            error: 'Authentication required. Please log in again.', 
            code: 'NO_AUTH',
            redirect: '/login?redirect=/profile'
          },
          { status: 401 }
        )
      );
    }

    const body = await request.json();
    
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        username: body.username,
        email: body.email
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isSubscribed: true,
        fidelityPoints: true
      }
    });

    return setCorsHeaders(NextResponse.json(updatedUser));
  } catch (error) {
    console.error('Error updating profile:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Server error', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}