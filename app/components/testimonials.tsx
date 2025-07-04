'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonialImages = [
  '/avis/avi1.png',
  '/avis/avi2.png',
  '/avis/avi3.png',
  '/avis/avi4.png',
  '/avis/avi5.png',
];

// Create testimonial objects with IDs
const testimonials = testimonialImages.map((src, index) => ({
  id: index + 1,
  image: src,
  alt: `Témoignage client ${index + 1}`
}));

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === sliderRef.current || sliderRef.current?.contains(document.activeElement)) {
        if (e.key === "ArrowRight") {
          handleNext();
        } else if (e.key === "ArrowLeft") {
          handlePrevious();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Calculate indices for visible testimonials
  const getVisibleIndices = () => {
    const indices = [];
    // Current testimonial
    indices.push(currentIndex);

    // Previous testimonials (2)
    for (let i = 1; i <= 2; i++) {
      indices.push((currentIndex - i + testimonials.length) % testimonials.length);
    }

    // Next testimonials (2)
    for (let i = 1; i <= 2; i++) {
      indices.push((currentIndex + i) % testimonials.length);
    }

    return indices;
  };

  const visibleIndices = getVisibleIndices();

  // Get position and z-index for each testimonial
  const getCardStyles = (index: number) => {
    const position = visibleIndices.indexOf(index);

    if (position === -1) return { x: 0, scale: 0.8, opacity: 0, zIndex: 0, display: "none" };

    switch (position) {
      case 0: // Current testimonial
        return { x: 0, scale: 1, opacity: 1, zIndex: 5, display: "block" };
      case 1: // Previous testimonial 1
        return { x: "-50%", scale: 0.8, opacity: 0.7, zIndex: 4, display: "block" };
      case 2: // Previous testimonial 2
        return { x: "-75%", scale: 0.65, opacity: 0.4, zIndex: 3, display: "block" };
      case 3: // Next testimonial 1
        return { x: "50%", scale: 0.8, opacity: 0.7, zIndex: 4, display: "block" };
      case 4: // Next testimonial 2
        return { x: "75%", scale: 0.65, opacity: 0.4, zIndex: 3, display: "block" };
      default:
        return { x: 0, scale: 0.8, opacity: 0, zIndex: 0, display: "none" };
    }
  };

  return (
    <section className="w-full py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4"><span className="text-gray-600 font-medium">Vos avis sur <span className="text-[#7c3f61] font-light">Aichic </span></span></h2>
        
        <div
          ref={sliderRef}
          className="relative h-[320px] overflow-hidden"
          tabIndex={0}
          aria-label="Témoignages clients"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {testimonials.map((testimonial, index) => {
              const { x, scale, opacity, zIndex, display } = getCardStyles(index);

              return (
                <motion.div
                  key={testimonial.id}
                  className="absolute w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer"
                  initial={false}
                  animate={{
                    x,
                    scale,
                    opacity,
                    zIndex,
                    display,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 },
                  }}
                  style={{ zIndex }}
                  onClick={() => index !== currentIndex && setCurrentIndex(index)}
                >
                  <div className="relative aspect-[16/9] w-full h-[250px]">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.alt}
                      fill
                      sizes="(max-width: 668px) 100vw, (max-width: 1000px) 50vw, 33vw"
                      className="object-contain p-2"
                      priority={index === currentIndex}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#7c3f61] rounded-full h-9 w-9 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110"
            onClick={handlePrevious}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-[#7c3f61] rounded-full h-9 w-9 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "bg-[#7c3f61] scale-125" : "bg-gray-300 hover:bg-gray-400",
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;