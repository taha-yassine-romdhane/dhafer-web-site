"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import MobileProductCard from "../components/MobileProductCard";

type TopProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
    stocks: Stock[];
  })[];
};

const TopVentePage = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
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
        console.error('Error fetching top products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load top products');
      } finally {
        setLoading(false);
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    fetchTopProducts();
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax Effect */}
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

export default TopVentePage;