import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Even if user doesn't exist, don't reveal that to prevent email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`)
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link'
      })
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Store the token in the database with an expiration time (1 hour)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)
    
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt
      }
    })

    // Get the base URL for the reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Send the password reset email
    await sendPasswordResetEmail(user.email, resetToken, baseUrl)

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
