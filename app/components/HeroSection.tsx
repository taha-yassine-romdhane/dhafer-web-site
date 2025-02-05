'use client'; // Add this if you're using Next.js 13+ with app directory
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    {
      src: '/11051605401.jpg',
      alt: 'Dar Koftan - Image 1'
    },
    {
      src: '/Sans titre.png',
      alt: 'Dar Koftan - Image 2'
    }
  ];

  useEffect(() => {
    // Auto-scroll every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
      {/* Background Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentImage === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Image Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              currentImage === index ? 'bg-white w-4' : 'bg-white/50'
            }`}
            onClick={() => setCurrentImage(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end py-10 text-center text-white px-4">
     
        <Link 
          href="/collections"
          className="rounded-full bg-white px-6 md:px-8 py-3 md:py-3 text-base md:text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 active:scale-95"
        >
          Voir la Collection
        </Link>
      </div>
    </section>
  );
}