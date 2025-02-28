// app/api/products/top-ventes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching top sales products...'); 

    const products = await prisma.product.findMany({
      where: {
        showInTopSales: true,
      },
      orderBy: [
        {
          priority: 'desc', // First order by priority
        },
        {
          orderCount: 'desc', // Then by number of orders
        }
      ],
      include: {
        colorVariants: {
          include: {
            images: true,
            stocks: true, // Include stocks for each color variant
          },
        },
      },
    });

    console.log(`Found ${products.length} top sales products`);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error); 
    return NextResponse.json(
      { error: 'Failed to fetch products. Please check the server logs.' },
      { status: 500 }
    );
  }
}