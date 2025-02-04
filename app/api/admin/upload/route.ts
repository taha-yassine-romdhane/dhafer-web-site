// app/api/admin/upload/route.ts
import { NextResponse } from 'next/server';
import imagekit from '@/lib/imagekit-config';
import sharp from 'sharp';



export async function POST(request: Request) {
  try {
    console.log('Starting file upload to ImageKit...');
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const positions = formData.getAll('positions') as string[];
    
    console.log(`Processing ${files.length} files...`);
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const position = positions[i] || 'side'; // default to 'side' if position not specified
      
      console.log(`Processing file: ${file.name}, position: ${position}`);
      
      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Compress the image using sharp
      const compressedBuffer = await sharp(buffer)
        .rotate() // Apply orientation based on EXIF data
        .resize({ width: 800 }) // Resize to a max width of 800px (adjust as needed)
        .jpeg({ quality: 95 }) // Compress to maximal quality
        .toBuffer();
      
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `${position}-${uniqueSuffix}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      try {
        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
          file: compressedBuffer, // Compressed buffer
          fileName: fileName,
          folder: '/products', // Optional: organize files in ImageKit
          tags: [position], // Optional: add tags for better organization
          useUniqueFileName: true,
        });

        console.log(`File uploaded successfully to ImageKit. URL: ${uploadResponse.url}`);
        
        uploadedImages.push({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
          position: position,
          thumbnailUrl: uploadResponse.thumbnailUrl,
        });
      } catch (uploadError) {
        console.error(`Error uploading file ${fileName} to ImageKit:`, uploadError);
        throw new Error(`Failed to upload ${fileName} to ImageKit`);
      }
    }

    console.log('All uploads complete. Uploaded images:', uploadedImages);
    return NextResponse.json({ 
      success: true, 
      images: uploadedImages 
    });
  } catch (error) {
    console.error('Error in upload process:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload images' 
      },
      { status: 500 }
    );
  }
}

// New route segment configuration
export const dynamic = 'force-dynamic'; // Ensure the route is dynamic
export const maxDuration = 30; // Set the maximum duration for the request (in seconds)