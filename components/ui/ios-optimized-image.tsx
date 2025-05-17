'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { isIOS, isIOSSafari } from '@/lib/device-detection';

interface IOSOptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  lowQualityPlaceholder?: boolean;
  fadeIn?: boolean;
  disableTransforms?: boolean;
}

/**
 * Image component optimized for iOS devices
 * Reduces quality, simplifies animations, and manages memory better
 */
export function IOSOptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.png',
  lowQualityPlaceholder = true,
  fadeIn = true,
  disableTransforms = false,
  priority = false,
  quality,
  loading: propLoading,
  ...props
}: IOSOptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're on iOS
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  
  // Determine loading strategy
  const loading = propLoading || (priority ? 'eager' : 'lazy');
  
  // Reduce quality on iOS devices to improve performance
  const iosQuality = isIOSDevice ? Math.min(quality as number || 75, 60) : (quality as number);
  
  // Setup device detection on client side
  useEffect(() => {
    setIsIOSDevice(isIOS());
    
    // If on iOS Safari, we'll use a more conservative approach
    if (isIOSSafari()) {
      // Disable some animations and effects
      document.documentElement.classList.add('ios-safari');
    }
  }, []);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    // Skip if priority is true (load immediately)
    if (priority) {
      setIsVisible(true);
      return;
    }
    
    // Use a more conservative threshold for iOS
    const threshold = isIOSDevice ? 0.01 : 0.1;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: isIOSDevice ? '300px' : '200px', // Load earlier on iOS
        threshold,
      }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [priority, isIOSDevice]);
  
  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image load error
  const handleError = () => {
    console.error(`Error loading image: ${src}`);
    setError(true);
  };
  
  // Clean up image data when component unmounts
  useEffect(() => {
    return () => {
      // Help browser garbage collect the image
      if (typeof src === 'string') {
        // Create a dummy image to replace the original one
        const img = document.createElement('img');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }
    };
  }, [src]);
  
  return (
    <div 
      ref={imageRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      {/* Placeholder or low-quality image */}
      {!isLoaded && lowQualityPlaceholder && (
        <div className="absolute inset-0 bg-gray-200" />
      )}
      
      {/* Only render the image if it's visible or priority is true */}
      {(isVisible || priority) && (
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          className={cn(
            // Use simpler animations on iOS
            isIOSDevice && fadeIn ? 'opacity-0 ios-fade-in' : 
              fadeIn ? 'transition-opacity duration-300 opacity-0' : '',
            isLoaded ? '!opacity-100' : '',
            // Disable transforms on iOS if requested
            isIOSDevice && disableTransforms ? 'ios-no-transform' : '',
            props.fill ? 'object-cover' : ''
          )}
          onLoadingComplete={handleLoad}
          onError={handleError}
          loading={loading}
          priority={priority}
          quality={iosQuality}
          {...props}
        />
      )}
    </div>
  );
}
