'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface CarouselImage {
  id: number;
  url: string;
  section: string;
  position: number;
  isActive: boolean;
  title: string | null;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
}

interface SliderImage {
  url: string;
  section: string;
}

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fallback images in case API fails
  const fallbackImages: CarouselImage[] = [];
  
  // Fetch carousel images from API
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/carousel-images');
        
        if (!response.ok) {
          throw new Error('Failed to fetch carousel images');
        }
        
        const data = await response.json();
        
        if (data.success && data.carouselImages && data.carouselImages.length > 0) {
          setCarouselImages(data.carouselImages);
        } else {
          // If no images or empty array, use fallback
          console.warn('No carousel images found, using fallbacks');
          setError('No carousel images found');
        }
      } catch (err) {
        console.error('Error fetching carousel images:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarouselImages();
  }, []);
  
  // Process images by section
  const processImages = () => {
    if (carouselImages.length === 0) return [];
    
    // Filter desktop images (SliderHome)
    const desktopImages = carouselImages.filter(img => img.section === 'SliderHome');
    
    // Filter mobile images (SliderHomeMobile)
    const mobileImages = carouselImages.filter(img => img.section === 'SliderHomeMobile');
    
    // Create an array of objects with desktop and mobile URLs
    const result = [];
    
    // Use the length of the longer array to determine how many slides to create
    const maxLength = Math.max(desktopImages.length, mobileImages.length);
    
    for (let i = 0; i < maxLength; i++) {
      // Use modulo to cycle through available images if there are fewer images than positions
      const desktopImage = desktopImages[i % desktopImages.length];
      const mobileImage = mobileImages[i % mobileImages.length];
      
      result.push({
        desktop: desktopImage.url,
        mobile: mobileImage.url,
        index: i
      });
    }
    
    return result;
  };
  
  const images = carouselImages.length > 0 ? processImages() : [];

  useEffect(() => {
    // Auto-scroll every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  // Show loading state or empty state if no images
  if (loading || images.length === 0) {
    return (
      <section className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-full w-full"></div>
      </section>
    );
  }

  return (
    <section className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden bg-gray-50 flex flex-col">
      <div className="relative flex-1">
        {/* Background Images */}
        {images.map((image, index) => (
          <Link href={"/collections"} key={index}>
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentImage === index ? 'opacity-100' : 'opacity-0'
                }`}
            >
              {/* Mobile Image */}
              <Image
                src={image.mobile}
                alt="Dar Koftan Slider Image"
                fill
                className="object-contain md:hidden"
                priority={index === 0}
                sizes="100vw"
              />
              {/* Desktop Image */}
              <Image
                src={image.desktop}
                alt="Dar Koftan Slider Image"
                fill
                className="hidden md:block object-contain"
                priority={index === 0}
                sizes="(max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0" />
            </div>
          </Link>
        ))}

        {/* Image Navigation Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 md:flex">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${currentImage === index ? 'bg-gray-900 w-4' : 'bg-gray-900/50 w-2'
                }`}
              onClick={() => setCurrentImage(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Hero Content - Only visible on desktop */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <div className="mt-auto pb-10"> {/* Pushes the button to the bottom */}
            <Link
              href="/collections"
              className="block rounded-full bg-white px-2 lg:px-5 md:px-3 py-2 md:py-3 text-xs lg:text-lg md:text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 active:scale-95"
            >
              Voir la Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}