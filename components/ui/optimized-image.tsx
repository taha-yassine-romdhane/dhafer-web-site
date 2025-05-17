"use client";

import { useState, useEffect } from "react";
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
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  // Determine loading strategy
  const loading = propLoading || (priority ? "eager" : "lazy");

  useEffect(() => {
    // Only set up intersection observer if not priority
    if (priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading when image is 200px from viewport
        threshold: 0.01,
      }
    );

    const currentId = `image-${Math.random().toString(36).substring(2, 9)}`;
    const element = document.getElementById(currentId);
    
    if (element) {
      observer.observe(element);
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
    setError(true);
  };

  return (
    <div 
      id={`image-${Math.random().toString(36).substring(2, 9)}`}
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      {/* Placeholder or low-quality image */}
      {!isLoaded && lowQualityPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main image */}
      {(isIntersecting || priority) && (
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          className={cn(
            fadeIn && "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            props.fill ? "object-cover" : ""
          )}
          onLoadingComplete={handleLoad}
          onError={handleError}
          loading={loading}
          priority={priority}
          {...props}
        />
      )}
    </div>
  );
}
