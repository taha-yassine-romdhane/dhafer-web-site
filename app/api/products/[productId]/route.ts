import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        colorVariants: {
          include: {
            images: true,
            stocks: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        sizes: {
          include: {
            size: true
          }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Extract size values from the sizes relation
    const productWithSizes = {
      ...product,
      sizes: product.sizes.map(sizeRelation => sizeRelation.size.value)
    }

    // Return the product with sizes
    return NextResponse.json(productWithSizes)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

