"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string;
  lowQualityPlaceholder?: boolean;
  fadeIn?: boolean;
  preload?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.png",
  lowQualityPlaceholder = true,
  fadeIn = true,
  preload = false,
  priority = false,
  loading: propLoading,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority); // Start as true if priority
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Determine loading strategy
  const loading = propLoading || (priority ? "eager" : "lazy");

  useEffect(() => {
    // Skip observer if priority is true
    if (priority) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if the image element is intersecting
        if (entries[0]?.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading when image is 200px from viewport
        threshold: 0.01,
      }
    );

    // Observe the current element if it exists
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Handle image load error
  const handleError = () => {
    console.error(`Error loading image: ${src}`);
    setError(true);
  };

  // Always render the Image component to avoid hydration issues
  return (
    <div 
      ref={imageRef}
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      {/* Placeholder or low-quality image */}
      {!isLoaded && lowQualityPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Always render the image but with conditional visibility */}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn(
          fadeIn && "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          !isIntersecting && !priority ? "invisible" : "", // Hide but keep in DOM
          props.fill ? "object-cover" : ""
        )}
        onLoadingComplete={handleLoad}
        onError={handleError}
        loading={loading}
        priority={priority}
        {...props}
      />
    </div>
  );
}
