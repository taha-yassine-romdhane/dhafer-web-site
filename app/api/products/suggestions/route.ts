import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const exclude = url.searchParams.get('exclude');

  if (!category) {
    return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        category,
        id: {
          not: Number(exclude),
        },
      },
      include: {
        colorVariants: {
          include: {
            images: true,
          },
        },
      },
      take: 5, // Limit the number of suggested products
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching suggested products:', error);
    return NextResponse.json({ error: 'Error fetching suggested products' }, { status: 500 });
  }
}