import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'
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

    // Verify password with crypto instead of bcrypt
    let passwordMatch = false;
    try {
      console.log('Comparing password');
      
      // Check if the stored password is in the new format (has a salt separator)
      if (user.password.includes(':')) {
        // Split the stored hash and salt
        const [storedHash, salt] = user.password.split(':');
        
        // Hash the provided password with the same salt
        const hash = crypto
          .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
          .toString('hex');
        
        // Compare the generated hash with the stored hash
        passwordMatch = storedHash === hash;
      } else {
        // Handle legacy bcrypt passwords - this will fail but allows migration
        console.log('Legacy password format detected, authentication will fail');
        passwordMatch = false;
      }
      
      console.log('Password comparison completed successfully');
    } catch (cryptoError) {
      console.error('Crypto error:', cryptoError);
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