import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Fetching top products...') // Debugging log

    const products = await prisma.product.findMany({
      take: 6, // Fetch top 6 products
      orderBy: {
        createdAt: 'desc', // Sort by latest
      },
      include: {
        colorVariants: {
          include: {
            images: true,
          },
        },
      },
    })

    console.log('Products fetched:', products) // Debugging log

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error) // Debugging log
    return NextResponse.json(
      { error: 'Failed to fetch products. Please check the server logs.' },
      { status: 500 }
    )
  }
}