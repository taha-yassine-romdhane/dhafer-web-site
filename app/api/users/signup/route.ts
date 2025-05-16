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
  console.log('Signup endpoint called');
  
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

    const { username, email, password } = body;
    console.log(`Signup attempt for email: ${email}, username: ${username}`);

    if (!username || !email || !password) {
      console.log('Missing required fields');
      const errorResponse = NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
      return setCorsHeaders(errorResponse);
    }

    // Check if user already exists
    try {
      console.log('Checking for existing user');
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { username: username }]
        }
      });
      console.log('Existing user check completed');

      if (existingUser) {
        console.log('User already exists');
        const errorResponse = NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        );
        return setCorsHeaders(errorResponse);
      }
    } catch (dbError) {
      console.error('Database error when checking existing user:', dbError);
      const errorResponse = NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
      return setCorsHeaders(errorResponse);
    }

    // Hash password with crypto instead of bcrypt
    let hashedPassword;
    try {
      console.log('Hashing password');
      
      // Generate a random salt
      const salt = crypto.randomBytes(16).toString('hex');
      
      // Hash the password using PBKDF2
      const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      
      // Store both the hash and salt, separated by a colon
      hashedPassword = `${hash}:${salt}`;
      
      console.log('Password hashed successfully');
    } catch (cryptoError) {
      console.error('Crypto error:', cryptoError);
      const errorResponse = NextResponse.json(
        { error: 'Error hashing password' },
        { status: 500 }
      );
      return setCorsHeaders(errorResponse);
    }

    // Create user with error handling
    let user;
    try {
      console.log('Creating user in database');
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      console.log('User created successfully');
    } catch (createError) {
      console.error('Error creating user:', createError);
      const errorResponse = NextResponse.json(
        { error: 'Error creating user' },
        { status: 500 }
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

    console.log('Signup successful, returning response');
    // Return the token in the response body
    const successResponse = NextResponse.json({
      message: 'User created successfully',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
    
    return setCorsHeaders(successResponse);

  } catch (error) {
    console.error('Signup error:', error);
    const errorResponse = NextResponse.json(
      { error: 'An error occurred during signup. Please try again later.' },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}