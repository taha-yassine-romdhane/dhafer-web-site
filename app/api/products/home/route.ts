import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Optimize by limiting number of products and selecting only necessary fields
    const products = await prisma.product.findMany({
      where: {
        showInHome: true, // Only fetch products marked to show in home
      },
      take: 8, // Limit to 8 products for better performance
      orderBy: [
        {
          priority: 'desc', // First order by priority
        },
        {
          createdAt: 'desc', // Then by creation date
        }
      ],
      include: {
        colorVariants: {
          take: 6, // Limit to 2 color variants per product
          include: {
            images: {
              take: 2, // Take only 2 images per variant
              orderBy: {
                isMain: 'desc' // Prioritize main images
              },
            },
            stocks: {
              take: 1,
            }
          },
        },
      },
    })

    // Filter out products with no color variants or images
    const filteredProducts = products.filter(product => 
      product.colorVariants && 
      product.colorVariants.length > 0 && 
      product.colorVariants.some((variant: any) => variant.images && variant.images.length > 0)
    )

    // Add caching headers for better performance
    return NextResponse.json(
      filteredProducts,
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching home products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home products' },
      { status: 500 }
    )
  }
}
