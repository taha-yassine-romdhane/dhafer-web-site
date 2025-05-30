// app/api/products/top-ventes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching top sales products based on order quantity...');

    // Get all order items with their products to calculate total quantities
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          select: {
            id: true,
          },
        },
      },
    });

    // Group by product and calculate total quantity ordered
    const productStats: Record<number, {
      id: number;
      totalQuantity: number;
    }> = {};

    orderItems.forEach(item => {
      const productId = item.product.id;
      
      if (!productStats[productId]) {
        productStats[productId] = {
          id: productId,
          totalQuantity: 0,
        };
      }
      
      productStats[productId].totalQuantity += item.quantity;
    });

    // Convert to array and sort by total quantity
    const topProductIds = Object.values(productStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 8) // Get top 8 by quantity
      .map(product => product.id);

    // Fetch the complete product data for these IDs
    const topProducts = await prisma.product.findMany({
      where: {
        id: {
          in: topProductIds
        }
      },
      include: {
        colorVariants: {
          include: {
            images: true,
            stocks: true, // Include stocks for each color variant
          },
        },
      },
    });

    // Sort the products in the same order as topProductIds
    const sortedProducts = topProductIds
      .map(id => topProducts.find(product => product.id === id))
      .filter(product => product !== undefined);

    // If we don't have enough products with orders, supplement with products based on priority
    if (sortedProducts.length < 8) {
      const remainingCount = 8 - sortedProducts.length;
      
      // Get IDs of products we already have to exclude them
      const existingProductIds = sortedProducts.map(product => product!.id);
      
      const additionalProducts = await prisma.product.findMany({
        take: remainingCount,
        where: {
          id: {
            notIn: existingProductIds
          }
        },
        orderBy: {
          priority: 'desc'
        },
        include: {
          colorVariants: {
            include: {
              images: true,
              stocks: true,
            },
          },
        },
      });
      
      // Combine the results
      const combinedProducts = [...sortedProducts, ...additionalProducts];
      
      console.log(`Found ${combinedProducts.length} top sales products (${sortedProducts.length} from order quantity, ${additionalProducts.length} from priority)`);
      return NextResponse.json(combinedProducts);
    }

    console.log(`Found ${sortedProducts.length} top sales products based on order quantity`);
    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error('Error fetching products:', error); 
    return NextResponse.json(
      { error: 'Failed to fetch products. Please check the server logs.' },
      { status: 500 }
    );
  }
}