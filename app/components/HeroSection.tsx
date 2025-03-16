'use client'; // Add this if you're using Next.js 13+ with app directory
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      desktop: '/sliders/PULLS.jpg',
      mobile: '/sliders/PULLS.jpg',
      alt: 'Dar Koftan - Image 1'
    },
    {
      desktop: '/sliders/Jalaba.jpg',
      mobile: '/sliders/Jalaba.jpg',
      alt: 'Dar Koftan - Image 2'
    },
    {
      desktop: '/sliders/Abaya.jpg',
      mobile: '/sliders/Abaya.jpg',
      alt: 'Dar Koftan - Image 3'
    },
  ];

  useEffect(() => {
    // Auto-scroll every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <section className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden bg-gray-50 flex flex-col">
      <div className="relative flex-1">
        {/* Background Images */}
        {images.map((image, index) => (
          <Link href="/collections" key={index}>
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentImage === index ? 'opacity-100' : 'opacity-0'
                }`}
            >
              {/* Mobile Image */}
              <Image
                src={image.mobile}
                alt={image.alt}
                fill
                className="object-contain md:hidden"
                priority={index === 0}
                sizes="100vw"
              />
              {/* Desktop Image */}
              <Image
                src={image.desktop}
                alt={image.alt}
                fill
                className="hidden md:block object-contain"
                priority={index === 0}
                sizes="(max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 " />
            </div>
          </Link>
        ))}

        {/* Image Navigation Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 hidden md:flex">
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
              className="hidden md:block rounded-full bg-white px-5 md:px-8 py-2 md:py-3 text-sm md:text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 active:scale-95"
            >
              Voir la Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}