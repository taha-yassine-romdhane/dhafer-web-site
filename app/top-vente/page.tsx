"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import MobileProductCard from "../components/MobileProductCard";
import Link from "next/link";

type TopProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
    stocks: Stock[];
  })[];
  sizes?: string[]; // Make sizes optional to match MobileProductCard requirements
};

// Helper function to transform product for mobile card
const transformProductForMobileCard = (product: TopProduct) => {
  // Extract unique sizes from all variants
  // Since we don't have direct access to size names, we'll use sizeId as a fallback
  // In a real application, you would fetch the actual size names from a sizes table
  const allSizes = product.colorVariants
    .flatMap(variant => variant.stocks.map(stock => `Size ${stock.sizeId}`))
    .filter((size, index, self) => self.indexOf(size) === index);
  
  return {
    ...product,
    sizes: allSizes.length > 0 ? allSizes : ['Unique'], // Add sizes array to product with fallback
  };
};

const TopVentePage = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // State for carousel images
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [carouselLoading, setCarouselLoading] = useState(true);

  const { inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products/top-ventes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load top products');
    } finally {
      setLoading(false);
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  
  // Fetch carousel images from API
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
  
  // Process images by section
  const processImages = () => {
    if (carouselImages.length === 0) return [];
    
    // Filter desktop images (SliderTopVente)
    const desktopImages = carouselImages.filter(img => img.section === 'SliderTopVente');
    
    // Filter mobile images (SliderTopVenteMobile)
    const mobileImages = carouselImages.filter(img => img.section === 'SliderTopVenteMobile');
    
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
    fetchTopProducts();
    fetchCarouselImages();
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    // Auto-scroll every 5 seconds (5000ms)
    if (images.length <= 1) return; // Don't auto-scroll if only one image
    
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dynamic Images */}
      {carouselLoading ? (
        <motion.div 
          className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="animate-pulse bg-gray-200 h-full w-full"></div>
        </motion.div>
      ) : images.length === 0 ? (
        // Fallback to static image if no images from API
        <motion.div 
          className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0">
            <Image
              src="/sliders/slider-page-top-vente.png"
              alt="Top Vente Collection"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0" />
          </div>
        </motion.div>
      ) : images.length === 1 ? (
        // Single image display (no carousel needed)
        <motion.div 
          className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Link href="/collections" className="absolute inset-0">
            {/* Mobile Image */}
            <Image
              src={images[0].mobile}
              alt="Dar Koftan Top Vente Image"
              fill
              className="object-contain md:hidden"
              priority
              sizes="100vw"
            />
            {/* Desktop Image */}
            <Image
              src={images[0].desktop}
              alt="Dar Koftan Top Vente Image"
              fill
              className="hidden md:block object-contain"
              priority
              sizes="(max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        </motion.div>
      ) : (
        // Multiple images - show carousel
        <motion.div 
          className="relative h-[25vh] md:h-[65vh] w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="relative flex-1 h-full">
            {/* Background Images */}
            {images.map((image, index) => (
              <Link href="/collections" key={index}>
                <div
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
                >
                  {/* Mobile Image */}
                  <Image
                    src={image.mobile}
                    alt="Dar Koftan Top Vente Image"
                    fill
                    className="object-contain md:hidden"
                    priority={index === 0}
                    sizes="100vw"
                  />
                  {/* Desktop Image */}
                  <Image
                    src={image.desktop}
                    alt="Dar Koftan Top Vente Image"
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
        </motion.div>
      )}

      {/* Products Grid Section */}
      <div id="top-vente-products" className="container mx-auto px-4 py-8">
        <motion.h2 
          className="text-3xl font-bold text-center text-[#7c3f61] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Nos Produits les Plus Vendus
        </motion.h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#7c3f61]" />
            <p className="mt-4 text-gray-600">Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-[#7c3f61] hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucun produit trouvé</p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {products && products.length > 0 ? products.map((product) => {
                  // Transform product to include sizes for mobile card
                  const transformedProduct = transformProductForMobileCard(product);
                  return (
                    <MobileProductCard key={product.id} product={transformedProduct} />
                  );
                }) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-600">Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products && products.length > 0 ? products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                )) : (
                  <div className="col-span-4 text-center py-8">
                    <p className="text-gray-600">Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TopVentePage;