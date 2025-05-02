import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.phone || !data.address || !data.productId || !data.colorId || !data.sizeId || !data.quantity || !data.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: Number(data.productId) },
      include: {
        colorVariants: {
          where: { id: Number(data.colorId) },
          include: {
            stocks: {
              where: { sizeId: Number(data.sizeId) },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: data.fullName,
        phoneNumber: data.phone,
        address: `${data.address}${data.governorate ? `, ${data.governorate}` : ''}`,
        totalAmount: Number(data.price) * Number(data.quantity),
        status: 'PENDING',
        items: {
          create: [
            {
              productId: Number(data.productId),
              colorVariantId: Number(data.colorId),
              sizeId: Number(data.sizeId),
              quantity: Number(data.quantity),
              price: Number(data.price),
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Update stock status
    await prisma.stock.updateMany({
      where: {
        productId: Number(data.productId),
        colorId: Number(data.colorId),
        sizeId: Number(data.sizeId)
      },
      data: {
        inStockOnline: false
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}