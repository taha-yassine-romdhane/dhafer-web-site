import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  console.log('Signup endpoint called');
  
  try {
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
    
    const { username, email, password } = body;
    console.log(`Signup attempt for email: ${email}, username: ${username}`);

    if (!username || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      console.log('Checking for existing user');
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { username: username }
          ]
        }
      });
      
      if (existingUser) {
        console.log('User already exists');
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 400 }
        );
      }
      console.log('No existing user found');
    } catch (dbError) {
      console.error('Database error when checking existing user:', dbError);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Hash password with timeout
    let hashedPassword;
    try {
      console.log('Hashing password');
      
      // Add a timeout for bcrypt operation
      const bcryptPromise = bcrypt.hash(password, 10);
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Password hashing timed out')), 10000)
      );
      
      hashedPassword = await Promise.race([bcryptPromise, timeoutPromise]);
      console.log('Password hashed successfully');
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return NextResponse.json(
        { error: 'Error processing password' },
        { status: 500 }
      );
    }

    // Create user
    try {
      console.log('Creating new user');
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          isSubscribed: false,
          fidelityPoints: 0
        }
      });
      console.log('User created successfully');
      
      return NextResponse.json(
        { message: 'User created successfully', userId: user.id },
        { status: 201 }
      );
    } catch (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Error creating user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again later.' },
      { status: 500 }
    );
  }
}