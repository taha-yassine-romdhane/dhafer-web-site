import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('category');
  const exclude = url.searchParams.get('exclude');

  if (!categoryId) {
    return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 });
  }

  try {
    // Convert categoryId to number
    const categoryIdNum = parseInt(categoryId, 10);
    
    if (isNaN(categoryIdNum)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    // Use the categories relation with some
    const products = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            categoryId: categoryIdNum
          }
        },
        id: {
          not: Number(exclude) || 0,
        },
      },
      include: {
        colorVariants: {
          include: {
            images: true,
          },
          take: 2
        },
      },
      take: 4 // Limit the number of suggested products
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching suggested products:', error);
    return NextResponse.json({ error: 'Error fetching suggested products' }, { status: 500 });
  }
}