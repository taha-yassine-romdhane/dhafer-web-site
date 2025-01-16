import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        colorVariants: {
          include: {
            images: true
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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)
    const data = await request.json()
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Delete existing color variants and their images
    await prisma.productImage.deleteMany({
      where: {
        colorVariant: {
          productId
        }
      }
    })
    await prisma.colorVariant.deleteMany({
      where: {
        productId
      }
    })

    // Update product with new data and color variants
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category.toLowerCase(),
        sizes: data.sizes,
        collaborateur: data.collaborateur,
        colorVariants: {
          create: data.colorVariants.map((variant: { color: string, images: { url: string, position: string, isMain: boolean }[] }) => ({
            color: variant.color,
            images: {
              create: variant.images.map(image => ({
                url: image.url,
                position: image.position,
                isMain: image.isMain
              }))
            }
          }))
        }
      },
      include: {
        colorVariants: {
          include: {
            images: true
          }
        }
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Delete the product (cascade will handle related records)
    await prisma.product.delete({
      where: {
        id: productId
      }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
