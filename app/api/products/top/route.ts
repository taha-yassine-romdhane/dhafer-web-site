import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        showInTopSales: true, // Only fetch products marked as top sales
      },
      orderBy: [
        {
          priority: 'desc', // First order by priority
        },
        {
          orderCount: 'desc', // Then by order count
        }
      ],
      include: {
        colorVariants: {
          include: {
            images: true,
          },
        },
      },
    })

    // Filter out products with no color variants or images
    const filteredProducts = products.filter(product => 
      product.colorVariants.length > 0 && 
      product.colorVariants.some(variant => variant.images.length > 0)
    )

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error fetching top sale products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top sale products' },
      { status: 500 }
    )
  }
}