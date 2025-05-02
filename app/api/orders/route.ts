import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId'); // Get the user ID from cookies

    const body = await req.json();
    const { customerName, phoneNumber, address, totalAmount, items } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !address || !totalAmount || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate each item and check stock
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price || !item.size || !item.color) {
        return NextResponse.json(
          { error: 'Invalid item data: missing required fields' },
          { status: 400 }
        );
      }

      // First, find the size ID from the size value
      const size = await prisma.size.findFirst({
        where: { value: item.size },
      });

      if (!size) {
        return NextResponse.json(
          { error: `Size ${item.size} not found` },
          { status: 404 }
        );
      }

      // Verify the product exists and get its color variant ID
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
        include: {
          colorVariants: {
            where: {
              color: item.color,
            },
            include: {
              stocks: {
                where: { sizeId: size.id },
              },
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.colorVariants.length === 0) {
        return NextResponse.json(
          { error: `Color variant ${item.color} not found for product ${item.productId}` },
          { status: 404 }
        );
      }



      // Assign the found colorVariantId
      item.colorVariantId = product.colorVariants[0].id;
    }

    // Store sizeIds for each item
    const itemsWithSizeIds = await Promise.all(items.map(async (item) => {
      const size = await prisma.size.findFirst({
        where: { value: item.size },
      });
      return {
        ...item,
        sizeId: size?.id
      };
    }));

    // Create the order with validated items
    const order = await prisma.order.create({
      data: {
        customerName,
        phoneNumber,
        address,
        totalAmount,
        status: 'PENDING',
        userId: userId ? parseInt(userId.value) : undefined, // Link order to user ID if logged in
        items: {
          create: itemsWithSizeIds.map((item) => ({
            quantity: item.quantity,
            sizeId: item.sizeId,
            price: item.price,
            productId: item.productId,
            colorVariantId: item.colorVariantId,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);

    // Improved error handling
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: error.message,
          type: error.constructor.name,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order', details: 'Unknown error' },
      { status: 500 }
    );
  }
}