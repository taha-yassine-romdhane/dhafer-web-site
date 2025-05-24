// app/api/products/top-ventes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching top sales products based on order data...'); 

    // Get top products based on order count
    const topProducts = await prisma.product.findMany({
      take: 8, // Limit to top 8 products
      orderBy: [
        {
          orderCount: 'desc', // Order by the number of times the product was ordered
        },
        {
          priority: 'desc', // Use priority as a secondary sort
        }
      ],
      where: {
        // Only include products that have been ordered at least once
        orderItems: {
          some: {}
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

    // If we don't have enough products with orders, supplement with products based on priority
    if (topProducts.length < 8) {
      const remainingCount = 8 - topProducts.length;
      
      // Get IDs of products we already have to exclude them
      const existingProductIds = topProducts.map(product => product.id);
      
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
      const combinedProducts = [...topProducts, ...additionalProducts];
      
      console.log(`Found ${combinedProducts.length} top sales products (${topProducts.length} from orders, ${additionalProducts.length} from priority)`);
      return NextResponse.json(combinedProducts);
    }

    console.log(`Found ${topProducts.length} top sales products from order data`);
    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Error fetching products:', error); 
    return NextResponse.json(
      { error: 'Failed to fetch products. Please check the server logs.' },
      { status: 500 }
    );
  }
}