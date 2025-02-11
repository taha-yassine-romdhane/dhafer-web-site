"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product, ProductImage } from "@/lib/types";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import ProductCard from "../components/ProductCard";

export type ProductWithImages = Product & {
  images: ProductImage[];
  salePrice: number | null;
  viewCount: number;
  orderCount: number;
};

const TopVentePage = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('Fetched products:', data);

        // Transform the fetched products to match the ProductWithImages type
        const transformedProducts = data.map((product: Product) => ({
          ...product,
          colorVariants: product.colorVariants || [], // Ensure colorVariants is defined
          images: product.colorVariants.length > 0 ? product.colorVariants[0].images : [],
          salePrice: product.salePrice || null,
          viewCount: product.viewCount || 0, // Ensure viewCount is defined
          orderCount: product.orderCount || 0, // Ensure orderCount is defined
        }));

        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  useEffect(() => {
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Fetched Products:', products);
  }, [loading, error, products]);

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
          className="text-3xl md:text-4xl font-bold text-center text-[#D4AF37] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Nos Meilleures Ventes
        </motion.h2>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopVentePage;