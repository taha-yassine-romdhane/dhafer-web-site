import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.JWT_SECRET || 'your-secret-key'
const key = new TextEncoder().encode(secretKey)

export type UserPayload = {
  userId: number;
  email: string;
}

export async function createToken(payload: UserPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function verifyJwtToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as UserPayload
  } catch (error) {
    return null
  }
}

export async function getUser(): Promise<UserPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  if (!token) return null

  try {
    const payload = await verifyJwtToken(token.value)
    return payload
  } catch (error) {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export function removeAuthCookie() {
  cookies().delete('token')
}
