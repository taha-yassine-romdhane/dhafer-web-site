"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { Loader2, RefreshCw } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";
import MobileProductCard from "@/app/components/MobileProductCard";
import Link from "next/link";
// We'll use our own implementation of transformProductForMobileCard
// import { transformProductForMobileCard, isProductValidForMobileCard } from "@/lib/product-utils";

type PromoProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
    stocks: Stock[];
  })[];
  sizes?: string[];
};

// Helper function to transform product for mobile card - local implementation
const transformProductForPromoCard = (product: PromoProduct) => {
  // Extract unique sizes from all variants
  // Since we don't have direct access to size names, we'll use sizeId as a fallback
  const allSizes = product.colorVariants
    .flatMap(variant => variant.stocks.map(stock => `Size ${stock.sizeId}`))
    .filter((size, index, self) => self.indexOf(size) === index);
  
  return {
    ...product,
    sizes: allSizes.length > 0 ? allSizes : ['Unique'], // Add sizes array to product with fallback
  };
};

const PromoPage = () => {
  const [products, setProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPromoProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/products/promo', {
        signal: controller.signal,
        cache: 'no-store'
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Received invalid data format from server');
      }
      
      setProducts(data);
      setLoading(false);
    } catch (error: unknown) {
      // Handle specific error types
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. The server took too long to respond.');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load promotional products');
      }
      setLoading(false);
    }
  }, [retryCount]);

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchPromoProducts();
  }, [fetchPromoProducts]);

  useEffect(() => {
    // Initial check for mobile
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Fetch products on mount
    fetchPromoProducts();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile, fetchPromoProducts]);

  // Simple fallback product display function
  const renderFallbackProduct = (product: PromoProduct) => {
    const mainImage = product.colorVariants?.[0]?.images?.[0]?.url || '/placeholder.jpg';
    return (
      <div key={product.id} className="border rounded-lg p-4 shadow-sm">
        <div className="aspect-square relative mb-2 bg-gray-100">
          <Image 
            src={mainImage} 
            alt={product.name} 
            fill 
            className="object-cover rounded-md" 
          />
        </div>
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-[#D4AF37] font-bold mt-1">{product.price} TND</p>
        <Link 
          href={`/product/${product.id}`}
          className="mt-2 block text-center bg-[#D4AF37] text-white py-2 rounded hover:bg-[#C09C2C] transition-colors"
        >
          Voir détails
        </Link>
      </div>
    );
  };

  // State for carousel images
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [carouselLoading, setCarouselLoading] = useState(true);

  // Fetch carousel images from API
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setCarouselLoading(true);
        const response = await fetch('/api/carousel-images');
        
        if (!response.ok) {
          throw new Error('Failed to fetch carousel images');
        }
        
        const data = await response.json();
        setCarouselImages(data);
      } catch (error) {
        console.error('Error fetching carousel images:', error);
      } finally {
        setCarouselLoading(false);
      }
    };
    
    fetchCarouselImages();
  }, []);

  // Process images by section
  const processImages = () => {
    if (carouselImages.length === 0) return [];
    
    // Filter desktop images (SliderPromo)
    const desktopImages = carouselImages.filter(img => img.section === 'SliderPromo');
    
    // Filter mobile images (SliderPromoMobile)
    const mobileImages = carouselImages.filter(img => img.section === 'SliderPromoMobile');
    
    // If no images found for these sections, return empty array
    if (desktopImages.length === 0 && mobileImages.length === 0) {
      return [];
    }
    
    // Create an array of objects with desktop and mobile URLs
    const result = [];
    
    // Use the length of the longer array to determine how many slides to create
    const maxLength = Math.max(desktopImages.length, mobileImages.length);
    
    for (let i = 0; i < maxLength; i++) {
      // If there are no desktop images, use the first mobile image for desktop too
      const desktopImage = desktopImages.length > 0 
        ? desktopImages[i % desktopImages.length] 
        : mobileImages[0];
      
      // If there are no mobile images, use the first desktop image for mobile too
      const mobileImage = mobileImages.length > 0 
        ? mobileImages[i % mobileImages.length] 
        : desktopImages[0];
      
      result.push({
        desktop: desktopImage.url,
        mobile: mobileImage.url,
        index: i
      });
    }
    
    return result;
  };
  
  const images = carouselImages.length > 0 ? processImages() : [];

  useEffect(() => {
    // Auto-scroll every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {carouselLoading ? (
        <div className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden flex items-center">
          <div className="animate-pulse bg-gray-200 h-full w-full"></div>
        </div>
      ) : images.length === 0 ? (
        // Fallback to static image if no images from API
        <div className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/sliders/slider-page-promo.png"
              alt="Promo Collection"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1250px) 50vw, 33vw"
            />
          </div>
        </div>
      ) : images.length === 1 ? (
        // Single image display (no carousel needed)
        <div className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden flex items-center">
          <Link href="/collections" className="absolute inset-0">
            {/* Mobile Image */}
            <Image
              src={images[0].mobile}
              alt="Dar Koftan Promo Image"
              fill
              className="object-contain md:hidden"
              priority
              sizes="100vw"
            />
            {/* Desktop Image */}
            <Image
              src={images[0].desktop}
              alt="Dar Koftan Promo Image"
              fill
              className="hidden md:block object-contain"
              priority
              sizes="(max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        </div>
      ) : (
        // Multiple images - show carousel
        <div className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden">
          <div className="relative flex-1">
            {/* Background Images */}
            {images.map((image, index) => (
              <Link href="/collections" key={index}>
                <div
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
                >
                  {/* Mobile Image */}
                  <Image
                    src={image.mobile}
                    alt="Dar Koftan Promo Image"
                    fill
                    className="object-contain md:hidden"
                    priority={index === 0}
                    sizes="100vw"
                  />
                  {/* Desktop Image */}
                  <Image
                    src={image.desktop}
                    alt="Dar Koftan Promo Image"
                    fill
                    className="hidden md:block object-contain"
                    priority={index === 0}
                    sizes="(max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
            ))}

            {/* Image Navigation Dots - only show if multiple images */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 md:flex">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full ${currentImage === index ? 'bg-white' : 'bg-gray-400'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Promo Products Grid */}
      <div id="promo-products" className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-[#D4AF37] mb-8">
          Nos Produits en Promotion
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            <p className="mt-4 text-gray-600">Chargement des promotions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-medium mb-2">Erreur:</p>
              <p className="mb-4">{error}</p>
              <Button 
                onClick={handleRetry}
                className="bg-red-100 hover:bg-red-200 text-red-800 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">Aucune promotion disponible actuellement.</p>
            <p className="text-gray-500 mt-2">Revenez bientôt pour découvrir nos nouvelles offres!</p>
          </div>
        ) : (
          <div>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {products && products.length > 0 ? products.map((product) => {
                  // Transform product to include sizes for mobile card
                  const transformedProduct = transformProductForPromoCard(product);
                  return (
                    <MobileProductCard key={`mobile-${product.id}`} product={transformedProduct} />
                  );
                }) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-600">Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products && products.length > 0 ? products.map((product) => (
                  <ProductCard key={`desktop-${product.id}`} product={product} />
                )) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-600">Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      

    </div>
  );
};

export default PromoPage;