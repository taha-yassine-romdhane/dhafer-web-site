'use client';
import React, { useState, useEffect } from 'react';
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
  // State for carousel images - initialize with empty arrays instead of fallback images
  const [imagesTop1, setImagesTop1] = useState<string[]>([]);
  const [imagesBottom, setImagesBottom] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndexTop, setCurrentIndexTop] = useState(0);
  const [currentIndexBottom, setCurrentIndexBottom] = useState(0);

  // Function to handle button clicks
  const handleButtonClick = () => {
    // Analytics or other click handling logic could go here
  };
  
  // First useEffect for fetching images
  useEffect(() => {
    let isMounted = true;
    
    // Fetch carousel images
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch('/api/carousel-images');
        
        if (!response.ok) {
          throw new Error('Failed to fetch carousel images');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.carouselImages) && isMounted) {
          
          // Filter images by section - try different section name variations
          // and don't filter by isActive initially to see all available images
          const topVente1Images = data.carouselImages
            .filter((img: CarouselImage) => {
              return img.section.toLowerCase().includes('topvente1') || 
                     img.section.toLowerCase().includes('top-vente1') || 
                     img.section.toLowerCase().includes('top_vente1') || 
                     img.section.toLowerCase() === 'topvente1';
            });
          
          const topVente2Images = data.carouselImages
            .filter((img: CarouselImage) => {
              return img.section.toLowerCase().includes('topvente2') || 
                     img.section.toLowerCase().includes('top-vente2') || 
                     img.section.toLowerCase().includes('top_vente2') || 
                     img.section.toLowerCase() === 'topvente2';
            });
          
          // Sort and map to URLs
          const topVente1Urls = topVente1Images
            .sort((a: CarouselImage, b: CarouselImage) => a.position - b.position)
            .map((img: CarouselImage) => img.url);
            
          const topVente2Urls = topVente2Images
            .sort((a: CarouselImage, b: CarouselImage) => a.position - b.position)
            .map((img: CarouselImage) => img.url);
          
          if (topVente1Urls.length > 0) {
            setImagesTop1(topVente1Urls);
          } else {
            console.warn('No images found for topvente1 section');
          }
          
          if (topVente2Urls.length > 0) {
            setImagesBottom(topVente2Urls);
          } else {
            console.warn('No images found for topvente2 section');
          }
        }
      } catch (err) {
        console.error('Error fetching carousel images:', err);
        if (isMounted) {
          setError('Failed to load carousel images');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchImages();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Separate useEffect for auto-sliding top carousel
  useEffect(() => {
    if (imagesTop1.length <= 1) return;
    
    const intervalId = setInterval(() => {
      setCurrentIndexTop(prevIndex => (prevIndex + 1) % imagesTop1.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [imagesTop1.length]);
  
  // Separate useEffect for auto-sliding bottom carousel
  useEffect(() => {
    if (imagesBottom.length <= 1) return;
    
    const intervalId = setInterval(() => {
      setCurrentIndexBottom(prevIndex => (prevIndex + 1) % imagesBottom.length);
    }, 7000);
    
    return () => clearInterval(intervalId);
  }, [imagesBottom.length]);

  return (
    <section className="container mx-auto p-2 sm:p-4 py-8 sm:py-16 relative rounded-lg overflow-hidden min-h-[500px] sm:min-h-[600px] bg-white">
      {/* Mixed Carousels */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-0 flex gap-2 sm:gap-4">
        {/* First Carousel (Slides Up) */}
        <div className="w-1/2 md:w-1/3 h-full overflow-hidden">
          {loading || imagesTop1.length === 0 ? (
            /* Skeleton Loader for First Carousel */
            <div className="h-full w-full">
              <div className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3] animate-pulse bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
              </div>
            </div>
          ) : (
            <div
              className="h-full flex flex-col transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentIndexTop * 100}%)` }}
            >
              {imagesTop1.map((src, index) => (
                <div key={index} className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3]" style={{ position: 'relative' }}>
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
          )}
        </div>

        {/* Second Carousel (Slides Down) */}
        <div className="w-1/2 md:w-1/3 h-full overflow-hidden">
          {loading || imagesBottom.length === 0 ? (
            /* Skeleton Loader for Second Carousel */
            <div className="h-full w-full">
              <div className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3] animate-pulse bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
              </div>
            </div>
          ) : (
            <div
              className="h-full flex flex-col transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentIndexBottom * 100}%)` }}
            >
              {imagesBottom.map((src, index) => (
                <div
                  key={index}
                  className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3]"
                  style={{ position: 'relative' }}
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
          )}
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