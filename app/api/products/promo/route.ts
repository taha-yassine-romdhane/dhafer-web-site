import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('[API] Starting promo products fetch request...')
    
    // First, test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('[API] Database connection successful')
    } catch (dbError) {
      console.error('[API] Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please check server configuration.' },
        { status: 503 }
      )
    }
    
    console.log('[API] Querying for promotional products...')
    
    // Log the query we're about to execute
    console.log('[API] Query: product.findMany where showInPromo=true')
    
    const startTime = Date.now()
    const promoProducts = await prisma.product.findMany({
      where: {
        showInPromo: true, // Only fetch products marked for promotions
      },
      orderBy: [
        {
          priority: 'desc', // Order by priority first
        },
        {
          createdAt: 'desc', // Then by creation date
        }
      ],
      include: {
        colorVariants: {
          include: {
            images: true,
            stocks: true, // Include stocks for each color variant
          },
        },
      },
    })
    const queryTime = Date.now() - startTime
    
    console.log(`[API] Query completed in ${queryTime}ms`)
    console.log(`[API] Found ${promoProducts.length} promotional products`)
    
    // Add CORS headers to ensure the response can be accessed from the frontend
    return new NextResponse(JSON.stringify(promoProducts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('[API] Error fetching promotional products:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to fetch promotional products'
    let errorDetails = {}
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}