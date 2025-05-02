import { NextResponse } from 'next/server';

// This is a client-side API route that fetches carousel images from the backend
export async function GET() {
  try {
    // Replace with your actual backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/admin/carousel-images`, {
      cache: 'no-store', // Don't cache the response
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch carousel images: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      carouselImages: data.carouselImages || []
    });
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch carousel images',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
