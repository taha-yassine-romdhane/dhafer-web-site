import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { createToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with error handling for database operations
    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          email: email
        }
      });
    } catch (dbError) {
      console.error('Database error when finding user:', dbError);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password with error handling
    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return NextResponse.json(
        { error: 'Error verifying password' },
        { status: 500 }
      );
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token with error handling
    let token;
    try {
      token = await createToken({
        userId: user.id,
        email: user.email
      });
    } catch (tokenError) {
      console.error('Token creation error:', tokenError);
      return NextResponse.json(
        { error: 'Error creating authentication token' },
        { status: 500 }
      );
    }

    // Create the response
    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });

    // Set the token cookie with error handling
    try {
      cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
    } catch (cookieError) {
      console.error('Cookie setting error:', cookieError);
      return NextResponse.json(
        { error: 'Error setting authentication cookie' },
        { status: 500 }
      );
    }

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again later.' },
      { status: 500 }
    );
  }
}