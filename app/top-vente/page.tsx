"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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

  const {  inView } = useInView({
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="bg-[#FFF8E1] min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <motion.div 
        className="relative h-[70vh] w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516041774595-cc1b7969480c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Top Vente Collection"
            fill
            className="object-cover transform scale-105 transition-transform duration-[2s]"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <motion.div 
          className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="mb-6 text-4xl md:text-6xl font-bold tracking-tight">
            Nos Meilleures Ventes
          </h1>
          <p className="mb-8 text-lg md:text-xl max-w-2xl">
            Découvrez notre sélection exclusive des produits les plus appréciés par nos clients
          </p>
          <Button
            asChild
            className="rounded-full bg-[#D4AF37]/90 px-8 py-6 text-lg font-semibold text-white 
                     hover:bg-[#D4AF37] hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Link href="#top-vente-products">
              Explorer la Collection
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Products Grid Section */}
      <div id="top-vente-products" className="container mx-auto px-4 py-16">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center text-[#D4AF37] mb-12"
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

      {/* Newsletter Section */}
      <motion.div 
        className="bg-gradient-to-r from-[#D4AF37] to-[#C5A227] py-16 text-center px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ne Manquez Pas Nos Nouveautés
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Inscrivez-vous pour être informé des dernières tendances et offres exclusives
          </p>
          <Button
            asChild
            className="rounded-full bg-white px-8 py-6 text-lg font-semibold text-[#D4AF37] 
                     hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Link href="/subscribe">
              Rejoignez Notre Newsletter
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TopVentePage;