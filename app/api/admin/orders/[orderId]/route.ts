import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = parseInt(params.orderId);

    if (!status || !orderId || isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Valid status and order ID are required' },
        { status: 400 }
      );
    }

    // Validate that the status is a valid OrderStatus enum value
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Get the current order with its items and stock information
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: true
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle stock updates based on status change
    if (status === 'CONFIRMED' && existingOrder.status !== 'CONFIRMED') {
      // Decrease stock when order is confirmed
      for (const item of existingOrder.items) {
        // Get available stock from physical locations (tunis, sousse, monastir)
        const availableStocks = await prisma.stock.findMany({
          where: {
            productId: item.productId,
            colorId: item.colorVariantId,
            size: item.size ?? 'default',
            location: {
              in: ['tunis', 'sousse', 'monastir']
            },
            quantity: {
              gt: 0
            }
          },
          orderBy: {
            quantity: 'desc' // Get locations with most stock first
          }
        });

        let remainingQuantity = item.quantity;

        // Decrease stock from available locations
        for (const stock of availableStocks) {
          if (remainingQuantity <= 0) break;

          const deductQuantity = Math.min(stock.quantity, remainingQuantity);
          await prisma.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity - deductQuantity }
          });

          remainingQuantity -= deductQuantity;
        }

        if (remainingQuantity > 0) {
          // If we couldn't fulfill the order from physical locations
          return NextResponse.json(
            { error: 'Insufficient stock available' },
            { status: 400 }
          );
        }
      }
    } else if (status === 'CANCELLED' && existingOrder.status === 'CONFIRMED') {
      // Restore stock when confirmed order is cancelled
      for (const item of existingOrder.items) {
        // Get the first physical location with this product
        const firstStock = await prisma.stock.findFirst({
          where: {
            productId: item.productId,
            colorId: item.colorVariantId || undefined,
            size: item.size || undefined,
            location: {
              in: ['tunis', 'sousse', 'monastir']
            }
          }
        });

        if (firstStock) {
          // Restore stock to the first available location
          await prisma.stock.update({
            where: { id: firstStock.id },
            data: { quantity: firstStock.quantity + item.quantity }
          });
        } else {
          // Create new stock entry in Tunis if no existing stock found
          await prisma.stock.create({
            data: {
              productId: item.productId,
              colorId: item.colorVariantId,
              size: item.size ?? 'default',
              location: 'tunis',
              quantity: item.quantity
            }
          });
        }
      }
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        items: {
          include: {
            product: true,
            colorVariant: true
          }
        }
      }
    });

    // Update online stock availability
    await updateOnlineStock();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Error updating order' },
      { status: 500 }
    );
  }
}

// Function to update online stock based on physical locations
async function updateOnlineStock() {
  // Get all product variants with their sizes
  const products = await prisma.product.findMany({
    include: {
      colorVariants: true,
      stocks: true
    }
  });

  for (const product of products) {
    for (const variant of product.colorVariants) {
      // Get unique sizes for this product variant
      const sizes = Array.from(new Set(product.stocks
        .filter(s => s.colorId === variant.id)
        .map(s => s.size)));

      for (const size of sizes) {
        // Calculate total physical stock
        const physicalStocks = await prisma.stock.findMany({
          where: {
            productId: product.id,
            colorId: variant.id,
            size: size,
            location: {
              in: ['tunis', 'sousse', 'monastir']
            }
          }
        });

        const totalPhysicalStock = physicalStocks.reduce((sum, stock) => sum + stock.quantity, 0);

        // Update or create online stock
        await prisma.stock.upsert({
          where: {
            productId_location_size_colorId: {
              productId: product.id,
              location: 'online',
              size: size,
              colorId: variant.id
            }
          },
          create: {
            productId: product.id,
            colorId: variant.id,
            size: size,
            location: 'online',
            quantity: totalPhysicalStock > 0 ? 1 : 0
          },
          update: {
            quantity: totalPhysicalStock > 0 ? 1 : 0
          }
        });
      }
    }
  }
}
