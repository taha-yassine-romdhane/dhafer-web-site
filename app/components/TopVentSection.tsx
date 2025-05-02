'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface CarouselImage {
  id: number;
  url: string;
  section: string;
  filename?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TopVentSection: React.FC = () => {
  // Fallback images in case API fails
  const fallbackImagesTop1 = ['/carousel/img1.JPG', '/carousel/img2.JPG', '/carousel/img3.JPG'];
  const fallbackImagesBottom = ['/carousel/img4.JPG', '/carousel/img5.JPG', '/carousel/img6.JPG'];
  
  const [imagesTop1, setImagesTop1] = useState<string[]>(fallbackImagesTop1);
  const [imagesBottom, setImagesBottom] = useState<string[]>(fallbackImagesBottom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIndexTop, setCurrentIndexTop] = useState(0);
  const [currentIndexBottom, setCurrentIndexBottom] = useState(0);

  // Fetch carousel images from the API
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/carousel-images');
        
        if (!response.ok) {
          throw new Error('Failed to fetch carousel images');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.carouselImages)) {
          // Filter images by section
          const topVente1Images = data.carouselImages
            .filter((img: CarouselImage) => img.section === 'topvente1' && img.isActive)
            .sort((a: CarouselImage, b: CarouselImage) => a.position - b.position)
            .map((img: CarouselImage) => img.url);
            
          const topVente2Images = data.carouselImages
            .filter((img: CarouselImage) => img.section === 'topvente2' && img.isActive)
            .sort((a: CarouselImage, b: CarouselImage) => a.position - b.position)
            .map((img: CarouselImage) => img.url);
          
          // Only update if we have images
          if (topVente1Images.length > 0) {
            setImagesTop1(topVente1Images);
          }
          
          if (topVente2Images.length > 0) {
            setImagesBottom(topVente2Images);
          }
        }
      } catch (err) {
        console.error('Error fetching carousel images:', err);
        setError('Failed to load carousel images');
        // Keep using fallback images
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarouselImages();
  }, []);
  
  // Preload images
  useEffect(() => {
    const preloadImages = (images: string[]) => {
      images.forEach((src) => {
        const img = new window.Image(); // Use window.Image instead of Image
        img.src = src;
      });
    };

    preloadImages(imagesTop1);
    preloadImages(imagesBottom);
  }, [imagesTop1, imagesBottom]);

  // Auto-slide functionality for the first carousel (slides up)
  useEffect(() => {
    const intervalTop = setInterval(() => {
      setCurrentIndexTop((prevIndex) => (prevIndex + 1) % imagesTop1.length);
    }, 5000); // Change slide every 3 seconds

    return () => clearInterval(intervalTop); // Cleanup interval on unmount
  }, [imagesTop1.length]);

  // Auto-slide functionality for the second carousel (slides down)
  useEffect(() => {
    const intervalBottom = setInterval(() => {
      setCurrentIndexBottom((prevIndex) => (prevIndex + 1) % imagesBottom.length);
    }, 7000); // Change slide every 4 seconds

    return () => clearInterval(intervalBottom); // Cleanup interval on unmount
  }, [imagesBottom.length]);

  const handleButtonClick = useCallback(() => {
    // Handle button click
  }, []);

  return (
    <section className="container mx-auto p-2 sm:p-4 py-8 sm:py-16 relative rounded-lg overflow-hidden min-h-[500px] sm:min-h-[600px] bg-white">
      {/* Mixed Carousels */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-0 flex gap-2 sm:gap-4">
        {/* First Carousel (Slides Up) */}
        <div className="w-1/2 md:w-1/3 h-full overflow-hidden">
          <div
            className="h-full flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndexTop * 100}%)` }}
          >
            {imagesTop1.map((src, index) => (
              <div key={index} className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3]">
                <Image
                  src={src}
                  alt={`Top Ventes Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0}
                  sizes="(max-width: 768px) 33vw, 25vw"
                  quality={75}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second Carousel (Slides Down) */}
        <div className="w-1/2 md:w-1/3 h-full overflow-hidden">
          <div
            className="h-full flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndexBottom * 100}%)` }}
          >
            {imagesBottom.map((src, index) => (
              <div
                key={index}
                className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3]"
              >
                <Image
                  src={src}
                  alt={`Top Ventes Image ${index + 4}`}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="(max-width: 768px) 33vw, 25vw"
                  quality={75}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center md:items-start items-center text-center md:text-left p-2 sm:p-4 md:pl-8">
        {/* Mobile version (centered with blur) */}
        <div className="relative w-[80%] md:hidden backdrop-blur-sm bg-white/30 rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
            Découvrez nos Top Ventes
          </h1>
          <p className="text-base sm:text-lg mb-4 text-gray-700 mx-auto">
            Explorez nos produits les plus populaires et profitez des meilleures offres.
          </p>
          <Link href="/top-vente" passHref className="block">
            <Button
              className="inline-flex items-center justify-center px-6 py-2.5 text-base font-semibold text-white bg-[#D4AF37] rounded-full hover:bg-[#D4AF37]/90 transition-colors shadow-lg hover:shadow-xl mx-auto w-full"
              onClick={handleButtonClick}
              aria-label="Voir les Top Ventes"
            >
              Voir les Top Ventes
            </Button>
          </Link>
        </div>

        {/* Desktop version (original left-aligned) */}
        <div className="hidden md:block md:w-[50%]">
          <h1 className="text-[40px] font-bold mb-6 text-gray-800">
            Découvrez nos Top Ventes
          </h1>
          <p className="text-xl mb-8 max-w-[80%] text-gray-700">
            Explorez nos produits les plus populaires et profitez des meilleures offres.
          </p>
          <Link href="/top-vente" passHref>
            <Button
              className="inline-flex items-center justify-center px-8 py-3 text-xl font-semibold text-white bg-[#D4AF37] rounded-full hover:bg-[#D4AF37]/90 transition-colors shadow-lg hover:shadow-xl"
              onClick={handleButtonClick}
              aria-label="Voir les Top Ventes"
            >
              Voir les Top Ventes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TopVentSection);