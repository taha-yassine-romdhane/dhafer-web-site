"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { Loader2 } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";
import MobileProductCard from "@/app/components/MobileProductCard";

type PromoProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
    stocks: Stock[];
  })[];
};

const PromoPage = () => {
  const [products, setProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        console.log('Starting to fetch promo products...');
        setLoading(true);
        setError(null);
        
        // Create an AbortController to handle timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch('/api/products/promo', {
          signal: controller.signal,
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store'
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        console.log('Received response with status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          let errorMessage = `HTTP error! status: ${response.status}`;
          
          try {
            // Try to parse as JSON, but handle case where it's not JSON
            const errorData = JSON.parse(errorText);
            if (errorData.error) errorMessage = errorData.error;
          } catch (e) {
            // Not JSON, use the text as is
            if (errorText) errorMessage = errorText;
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} promo products successfully`);
        setProducts(data);
      } catch (error: unknown) {
        // Handle specific error types
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Request timed out after 15 seconds');
          setError('Request timed out. The server took too long to respond.');
        } else {
          console.error('Error fetching promotional products:', error);
          setError(error instanceof Error ? error.message : 'Failed to load promotional products');
        }
      } finally {
        setLoading(false);
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the md breakpoint in Tailwind
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile)
      fetchPromoProducts();
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
          <div className="absolute inset-0" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
        </div>
      </div>

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
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4 text-[#D4AF37] hover:underline"
            >
              Réessayer
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">Aucune promotion disponible actuellement.</p>
            <p className="text-gray-500 mt-2">Revenez bientôt pour découvrir nos nouvelles offres!</p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <MobileProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PromoPage;