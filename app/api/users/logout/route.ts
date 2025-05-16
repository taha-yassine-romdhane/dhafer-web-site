import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // With localStorage-based authentication, server-side logout is simpler
    // The token is cleared on the client side
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}