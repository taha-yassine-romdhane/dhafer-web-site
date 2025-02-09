import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { verifyJwtToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the token and get the user ID
    const payload = await verifyJwtToken(token.value)
    if (!payload?.userId || typeof payload.userId !== 'number') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        isSubscribed: true,
        fidelityPoints: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error getting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
