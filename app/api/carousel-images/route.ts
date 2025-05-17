import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This is a client-side API route that fetches carousel images from the backend
export async function GET() {
  try {
    // Get carousel images with appropriate limits
    const carouselImages = await prisma.carouselImage.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      // No take limit since we need all sections
      select: {
        id: true,
        url: true,
        section: true,
        position: true,
        isActive: true,
        // Only include necessary fields for the UI
        title: true,
        description: true,
        buttonText: true,
        buttonLink: true
      }
    });

    // Add caching headers for better performance
    return NextResponse.json(
      {
        success: true,
        carouselImages
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
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
