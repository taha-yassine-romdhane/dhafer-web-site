import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find the token in the database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    // Check if token exists and is not expired
    if (!resetToken || resetToken.expiresAt < new Date()) {
      // If token doesn't exist or is expired, return an error
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Token is valid
    return NextResponse.json({
      message: 'Token is valid',
      email: resetToken.user.email // Return the email for display purposes
    })
  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { error: 'An error occurred while verifying the token' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
