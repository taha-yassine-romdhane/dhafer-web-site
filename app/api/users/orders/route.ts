import { NextResponse, NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const secret = process.env.JWT_SECRET;

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function GET(request: NextRequest) {
  try {
    console.log('Orders endpoint called');
    
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
            redirect: '/login?redirect=/orders'
          },
          { status: 401 }
        )
      );
    }
    
    // User authenticated successfully
    return await handleAuthenticatedRequest(user);
  } catch (error) {
    console.error('Error in orders API:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Server error', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    );
  }
}

async function handleAuthenticatedRequest(user: any) {
  try {
    
    console.log('Fetching orders for user:', user.userId);
    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: {
              include: {
                images: true
              }
            },
            size: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return setCorsHeaders(NextResponse.json(orders));
  } catch (error) {
    console.error('Error fetching orders:', error);
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