import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { createToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setCorsHeaders, handleCors } from '@/lib/cors'

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  console.log('Login endpoint called');
  
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      const errorResponse = NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
      return setCorsHeaders(errorResponse);
    }
    
    const { email, password } = body;
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      console.log('Missing email or password');
      const errorResponse = NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
      return setCorsHeaders(errorResponse);
    }

    // Find user with error handling for database operations
    let user;
    try {
      console.log('Querying database for user');
      user = await prisma.user.findUnique({
        where: {
          email: email
        }
      });
      console.log('Database query completed');
    } catch (dbError) {
      console.error('Database error when finding user:', dbError);
      const errorResponse = NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
      return setCorsHeaders(errorResponse);
    }

    if (!user) {
      console.log('User not found');
      const errorResponse = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      return setCorsHeaders(errorResponse);
    }

    // Verify password with error handling and timeout
    let passwordMatch;
    try {
      console.log('Comparing password');
      
      // Use a lower cost factor for bcrypt in Docker environment
      // This is a workaround for memory issues in constrained environments
      const bcryptPromise = bcrypt.compare(password, user.password);
      
      // Increase timeout to 20 seconds
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Password verification timed out')), 20000)
      );
      
      // Add more detailed logging
      console.log('Starting password comparison...');
      try {
        passwordMatch = await Promise.race([bcryptPromise, timeoutPromise]);
        console.log('Password comparison completed successfully');
      } catch (innerError) {
        console.error('Inner error during password comparison:', innerError);
        throw innerError;
      }
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      const errorResponse = NextResponse.json(
        { error: 'Error verifying password' },
        { status: 500 }
      );
      return setCorsHeaders(errorResponse);
    }

    if (!passwordMatch) {
      console.log('Password does not match');
      const errorResponse = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      return setCorsHeaders(errorResponse);
    }

    // Create JWT token with error handling
    let token;
    try {
      console.log('Creating JWT token');
      token = await createToken({
        userId: user.id,
        email: user.email
      });
      console.log('JWT token created successfully');
    } catch (tokenError) {
      console.error('Token creation error:', tokenError);
      const errorResponse = NextResponse.json(
        { error: 'Error creating authentication token' },
        { status: 500 }
      );
      return setCorsHeaders(errorResponse);
    }

    console.log('Login successful, returning response');
    // Return the token in the response body
    const successResponse = NextResponse.json({
      message: 'Logged in successfully',
      token: token, // Include the token in the response
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
    
    return setCorsHeaders(successResponse);

  } catch (error) {
    console.error('Login error:', error);
    const errorResponse = NextResponse.json(
      { error: 'An error occurred during login. Please try again later.' },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}