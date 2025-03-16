import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size')
    const colorId = searchParams.get('colorId')

    // If size and colorId are provided, filter by them
    if (size && colorId) {
      const stocks = await prisma.stock.findMany({
        where: {
          productId: parseInt(params.productId),
          size,
          colorId: parseInt(colorId),
        },
      })
      return NextResponse.json(stocks)
    }
    
    // Otherwise return all stock data for this product
    const stocks = await prisma.stock.findMany({
      where: {
        productId: parseInt(params.productId),
      },
    })

    return NextResponse.json(stocks)
  } catch (error) {
    console.error('Error fetching stock:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock information' },
      { status: 500 }
    )
  }
}
