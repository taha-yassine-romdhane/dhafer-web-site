import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health check endpoint for Docker and monitoring
 * This endpoint verifies that the application is running and can connect to the database
 */
export async function GET() {
  try {
    // Check database connection by running a simple query
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Service is healthy'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Service is unhealthy',
        error: process.env.NODE_ENV === 'production' ? 'Database connection failed' : String(error)
      },
      { status: 500 }
    )
  }
}
