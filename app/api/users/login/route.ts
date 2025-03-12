import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { createToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  console.log('Login endpoint called');
  
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password with error handling and timeout
    let passwordMatch;
    try {
      console.log('Comparing password');
      
      // Add a timeout for bcrypt operation
      const bcryptPromise = bcrypt.compare(password, user.password);
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Password verification timed out')), 10000)
      );
      
      passwordMatch = await Promise.race([bcryptPromise, timeoutPromise]);
      console.log('Password comparison completed');
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return NextResponse.json(
        { error: 'Error verifying password' },
        { status: 500 }
      );
    }

    if (!passwordMatch) {
      console.log('Password does not match');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'Error creating authentication token' },
        { status: 500 }
      );
    }

    console.log('Login successful, returning response');
    // Return the token in the response body
    return NextResponse.json({
      message: 'Logged in successfully',
      token: token, // Include the token in the response
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again later.' },
      { status: 500 }
    );
  }
}