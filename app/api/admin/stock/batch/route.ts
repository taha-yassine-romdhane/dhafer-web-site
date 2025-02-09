import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const { updates } = await request.json();

    // Validate input
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid updates data' },
        { status: 400 }
      );
    }

    // Filter out any virtual online stock updates
    const validStockIds = Object.keys(updates).map(id => parseInt(id));
    const existingStocks = await prisma.stock.findMany({
      where: { id: { in: validStockIds } }
    });

    // Create a map of valid updates (excluding online stock)
    const validUpdates = existingStocks.reduce((acc, stock) => {
      if (stock.location !== 'online' && updates[stock.id] !== undefined) {
        acc[stock.id] = updates[stock.id];
      }
      return acc;
    }, {} as Record<number, number>);

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid stock updates provided' },
        { status: 400 }
      );
    }

    // Process all valid updates in a transaction
    const results = await prisma.$transaction(
      Object.entries(validUpdates).map(([stockId, quantity]) => {
        return prisma.stock.update({
          where: { id: parseInt(stockId) },
          data: { quantity: quantity }
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Stocks updated successfully',
      updatedStocks: results
    });
  } catch (error) {
    console.error('Error updating stocks:', error);
    return NextResponse.json(
      { error: 'Failed to update stocks' },
      { status: 500 }
    );
  }
}

// Function to update online stock based on physical locations
async function updateOnlineStock() {
  try {
    const products = await prisma.product.findMany({
      include: {
        colorVariants: {
          include: {
            stocks: true
          }
        }
      }
    });

    for (const product of products) {
      for (const variant of product.colorVariants) {
        // Get unique sizes for this product variant
        const sizes = Array.from(new Set(variant.stocks
          .filter(s => s.location !== 'online')
          .map(s => s.size)
        ));

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

          const totalPhysicalQuantity = physicalStocks.reduce(
            (sum, stock) => sum + stock.quantity,
            0
          );

          // Check if online stock exists
          const existingOnlineStock = await prisma.stock.findUnique({
            where: {
              productId_location_size_colorId: {
                productId: product.id,
                location: 'online',
                size: size,
                colorId: variant.id
              }
            }
          });

          // Only create or update if online stock doesn't exist
          if (!existingOnlineStock) {
            await prisma.stock.create({
              data: {
                productId: product.id,
                colorId: variant.id,
                size: size,
                location: 'online',
                quantity: totalPhysicalQuantity
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating online stock:', error);
    throw error;
  }
}
