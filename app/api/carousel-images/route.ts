import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This is a client-side API route that fetches carousel images from the backend
export async function GET() {
  try {
    const carouselImages = await prisma.carouselImage.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        url: true,
        section: true,
        position: true,
        isActive: true,
        title: true,
        description: true,
        buttonText: true,
        buttonLink: true
      }
    });

    return NextResponse.json({
      success: true,
      carouselImages
    });
  } catch (error) {
    console.error('Database error fetching carousel images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch carousel images from database',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
