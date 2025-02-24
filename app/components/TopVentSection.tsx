'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Import shadcn Button

const TopVentSection: React.FC = () => {
  const imagesTop1 = ['/carousel/img1.JPG', '/carousel/img2.JPG', '/carousel/img3.JPG']; // First carousel (slides up)
  const imagesBottom = ['/carousel/img4.JPG', '/carousel/img5.JPG', '/carousel/img6.JPG']; // Second carousel (slides down)

  const [currentIndexTop, setCurrentIndexTop] = useState(0);
  const [currentIndexBottom, setCurrentIndexBottom] = useState(0);

  // Auto-slide functionality for the first carousel (slides up)
  useEffect(() => {
    const intervalTop = setInterval(() => {
      setCurrentIndexTop((prevIndex) => (prevIndex + 1) % imagesTop1.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(intervalTop); // Cleanup interval on unmount
  }, [imagesTop1.length]);

  // Auto-slide functionality for the second carousel (slides down)
  useEffect(() => {
    const intervalBottom = setInterval(() => {
      setCurrentIndexBottom((prevIndex) => (prevIndex + 1) % imagesBottom.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(intervalBottom); // Cleanup interval on unmount
  }, [imagesBottom.length]);

  const handleButtonClick = useCallback(() => {
    // Handle button click
  }, []);

  return (
    <section className="container mx-auto px-4 py-16 relative bg-white rounded-lg overflow-hidden min-h-[600px]">
      {/* Mixed Carousels */}
      <div className="absolute top-0 right-0 w-1/2 h-full z-0 flex gap-4">
        {/* First Carousel (Slides Up) */}
        <div className="w-1/3 h-full overflow-hidden">
          <div
            className="h-full flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndexTop * 100}%)` }}
          >
            {imagesTop1.map((src, index) => (
              <div
                key={index}
                className="min-h-full w-full relative aspect-[2/3]"
              >
                <Image
                  src={src}
                  alt={`Top Ventes Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0} // Only prioritize the first image
                  loading={index === 0 ? 'eager' : 'lazy'} // Lazy load non-visible images
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second Carousel (Slides Down) */}
        <div className="w-1/3 h-full overflow-hidden">
          <div
            className="h-full flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndexBottom * 100}%)` }}
          >
            {imagesBottom.map((src, index) => (
              <div
                key={index}
                className="min-h-full w-full relative aspect-[2/3]"
              >
                <Image
                  src={src}
                  alt={`Top Ventes Image ${index + 4}`}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0} // Only prioritize the first image
                  loading={index === 0 ? 'eager' : 'lazy'} // Lazy load non-visible images
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[50%] h-full flex flex-col justify-center items-start pl-8">
        <h1 className="text-[40px] font-bold mb-6 text-gray-800">
          Découvrez nos Top Ventes
        </h1>
        <p className="text-gray-700 text-xl mb-8 max-w-[80%]">
          Explorez nos produits les plus populaires et profitez des meilleures offres.
        </p>
        <Link href="/top-vente" passHref>
          <Button
            className="inline-flex items-center justify-center px-10 py-4 text-xl font-semibold text-white bg-[#D4AF37] rounded-full hover:bg-[#D4AF37]/90 transition-colors shadow-lg hover:shadow-xl"
            onClick={handleButtonClick}
            aria-label="Voir les Top Ventes"
          >
            Voir les Top Ventes
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(TopVentSection);