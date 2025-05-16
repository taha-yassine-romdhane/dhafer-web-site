import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const value = searchParams.get('value');
    
    if (!value) {
      return NextResponse.json(
        { error: 'Size value is required' },
        { status: 400 }
      );
    }

    // Find the size by its value
    const size = await prisma.size.findFirst({
      where: { value },
    });

    if (!size) {
      return NextResponse.json(
        { error: `Size with value '${value}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(size);
  } catch (error) {
    console.error('Error fetching size:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch size',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
