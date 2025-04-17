"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { Loader2, RefreshCw } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";
import MobileProductCard from "@/app/components/MobileProductCard";
import Link from "next/link";

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
  const [retryCount, setRetryCount] = useState(0);

  const fetchPromoProducts = useCallback(async () => {
    try {
      console.log(`Attempt ${retryCount + 1}: Starting to fetch promo products...`);
      setLoading(true);
      setError(null);
      
      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/products/promo', {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'x-request-time': Date.now().toString() // Add timestamp to prevent caching
        }
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      console.log('Received response with status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Log the raw response before parsing
      const responseText = await response.text();
      console.log('Raw API response length:', responseText.length);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`Fetched ${Array.isArray(data) ? data.length : 'unknown'} promo products successfully`);
        
        // Verify data structure
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data);
          throw new Error('Received invalid data format from server');
        }
        
        // Force a state update with the parsed data
        setProducts(data);
        setLoading(false);
        
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Failed to parse server response');
      }
    } catch (error: unknown) {
      // Handle specific error types
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out after 15 seconds');
        setError('Request timed out. The server took too long to respond.');
      } else {
        console.error('Error fetching promotional products:', error);
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
          <div key={`promo-grid-${products.length}-${retryCount}`}>
            {/* Show products count for debugging */}
            <p className="text-sm text-gray-500 mb-4">{products.length} produit(s) en promotion</p>
            
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <MobileProductCard key={`mobile-${product.id}`} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={`desktop-${product.id}`} product={product} />
                ))}
              </div>
            )}
            
            {/* Fallback display if the normal grid doesn't render properly */}
            {products.length > 0 && (
              <div className="mt-12 border-t pt-8 hidden" id="fallback-products">
                <h3 className="text-xl font-semibold mb-6">Autres produits en promotion:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => renderFallbackProduct(product))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Emergency script to show fallback if main grid fails */}
      <script dangerouslySetInnerHTML={{ __html: `
        setTimeout(() => {
          const mainGrid = document.querySelector('#promo-products .grid');
          const fallback = document.querySelector('#fallback-products');
          if (fallback && (!mainGrid || mainGrid.children.length === 0)) {
            fallback.classList.remove('hidden');
            console.log('Showing fallback product grid');
          }
        }, 2000);
      `}} />
    </div>
  );
};

export default PromoPage;