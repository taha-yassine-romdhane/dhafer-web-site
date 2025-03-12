import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Ensure we have a valid secret key
const secretKey = process.env.JWT_SECRET
if (!secretKey || secretKey === 'your-secret-key') {
  console.warn('WARNING: Using default JWT secret key. Set JWT_SECRET environment variable for production.')
}

const key = new TextEncoder().encode(secretKey || 'your-secret-key')

export type UserPayload = {
  userId: number;
  email: string;
}

export async function createToken(payload: UserPayload) {
  try {
    console.log('Creating JWT token with payload:', JSON.stringify(payload));
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key);
    console.log('JWT token created successfully');
    return token;
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw new Error('Failed to create authentication token');
  }
}

export async function verifyJwtToken(token: string): Promise<UserPayload | null> {
  try {
    console.log('Verifying JWT token');
    const { payload } = await jwtVerify(token, key);
    console.log('JWT token verified successfully');
    return payload as UserPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export async function getUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      console.log('No token cookie found');
      return null;
    }

    try {
      const payload = await verifyJwtToken(token.value);
      return payload;
    } catch (error) {
      console.error('Error verifying token from cookie:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
}

export function setAuthCookie(token: string) {
  try {
    console.log('Setting auth cookie');
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    console.log('Auth cookie set successfully');
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    throw new Error('Failed to set authentication cookie');
  }
}

export function removeAuthCookie() {
  try {
    console.log('Removing auth cookie');
    cookies().delete('token');
    console.log('Auth cookie removed successfully');
  } catch (error) {
    console.error('Error removing auth cookie:', error);
  }
}
