'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function AProposSection() {
  const images = [
    '/carousel/img7.JPG',
    '/carousel/img8.JPG',
    '/carousel/img9.JPG',
    '/carousel/img10.png',
    '/carousel/img11.png',
    '/carousel/img12.png',
    '/carousel/img13.png',
    '/carousel/img14.png',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      skipSnaps: false,
      startIndex: 0,
      dragFree: false,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="relative">
            {/* Main Carousel */}
            <div 
              className="overflow-hidden rounded-lg bg-black/5 backdrop-blur-sm" 
              ref={emblaRef}
            >
              <div className="flex touch-pan-y">
                {images.map((src, index) => (
                  <div
                    className={`relative min-w-0 flex-[0_0_100%] transition-opacity duration-300
                              ${currentIndex === index ? 'opacity-100' : 'opacity-60'}`}
                    key={index}
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-lg">
                      <div className="relative h-full w-full">
                        <Image
                          src={src}
                          alt={`A Propos Image ${index + 1}`}
                          fill
                          className="object-cover object-center transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="mt-4 flex justify-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 
                            ${currentIndex === index 
                              ? 'bg-black w-6' 
                              : 'bg-black/20 w-2 hover:bg-black/40'}`}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-bold">À Propos de Dar Koftan</h2>
            <p className="mb-6 text-lg text-gray-600">
              Dar Koftan est votre destination de choix pour des caftans traditionnels de haute qualité. 
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