'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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

export default function AProposSection() {
  // Empty array for images
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Single useEffect for all initialization and cleanup
  useEffect(() => {
    let isMounted = true;
    
    // Fetch carousel images
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch('/api/carousel-images');
        
        if (!response.ok) throw new Error('Failed to fetch carousel images');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.carouselImages) && isMounted) {
          // Filter images by section
          const aboutImagesFiltered = data.carouselImages
            .filter((img: CarouselImage) => img.section === 'about' && img.isActive);
          
          // Sort and map to URLs
          const aboutImages = aboutImagesFiltered
            .sort((a: CarouselImage, b: CarouselImage) => a.position - b.position)
            .map((img: CarouselImage) => img.url);
          
          if (aboutImages.length > 0) {
            setImages(aboutImages);
          }
        }
      } catch (err) {
        console.error('Using fallback images:', err);
        if (isMounted) {
          setError('Failed to load carousel images - using defaults');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    // Initialize
    fetchImages();
    
    // Set up auto-play
    let interval: NodeJS.Timeout | null = null;
    
    if (images.length > 0) {
      interval = setInterval(() => {
        if (isMounted) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }
      }, 5000);
    }
    
    // Cleanup
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [images.length]);
  
  // Function to handle manual navigation
  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  return (
    <section className="gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="relative">
            {/* Custom Carousel */}
            <div className="overflow-hidden rounded-lg bg-black/5 backdrop-blur-sm">
              {loading || images.length === 0 ? (
                /* Skeleton Loader */
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <div className="h-full w-full animate-pulse bg-gray-200 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                  </div>
                  
                  {/* Skeleton for navigation dots */}
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="animate-pulse w-6 h-2 rounded-full bg-gray-300"></div>
                    <div className="animate-pulse w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="animate-pulse w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {images.map((src, index) => (
                    <div
                      key={index}
                      className="relative min-w-full flex-shrink-0 transition-opacity duration-200"
                      style={{ opacity: currentIndex === index ? 1 : 0.6 }}
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-lg">
                        <div className="relative h-full w-full" style={{ position: 'relative' }}>
                          <Image
                            src={src}
                            alt={`A Propos Image ${index + 1}`}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0} // Only prioritize the first image
                            loading={index === 0 ? 'eager' : 'lazy'} // Lazy load non-visible images
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Dots */}
            <div className="mt-4 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 
                            ${currentIndex === index 
                              ? 'bg-black w-6' 
                              : 'bg-black/20 w-2 hover:bg-black/40'}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-bold">À Propos de Dar Al Koftan Al Assil</h2>
            <p className="mb-6 text-lg text-gray-600">
              Dar Al Koftan Al Assil est votre destination de choix pour des caftans traditionnels de haute qualité. 
              Nous sommes fiers de perpétuer l&apos;héritage de l&apos;artisanat tunisien tout en apportant 
              une touche moderne à nos créations.
            </p>
            <p className="mb-8 text-lg text-gray-600">
              Chaque pièce est soigneusement confectionnée par nos artisans qualifiés, 
              utilisant les meilleurs tissus et techniques traditionnelles pour créer 
              des vêtements qui allient élégance, confort et authenticité.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-white p-4 shadow transition-transform duration-300 hover:scale-105">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Artisanal</h3>
                <p className="text-gray-600">Fait main avec soin</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow transition-transform duration-300 hover:scale-105">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Qualité</h3>
                <p className="text-gray-600">Matériaux premium</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow transition-transform duration-300 hover:scale-105">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Tradition</h3>
                <p className="text-gray-600">Savoir-faire ancestral</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}