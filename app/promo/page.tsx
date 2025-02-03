"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Product, ColorVariant, ProductImage } from "@prisma/client";
import { Loader2 } from "lucide-react";
import ProductCard from "@/app/components/ProductCard"; // Ensure you have this component

type PromoProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
  })[];
};

const PromoPage = () => {
  const [products, setProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/products/promo');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching promotional products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load promotional products');
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  return (
    <div className="bg-[#FFF8E1] min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1572584642822-6f8de0243c93?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Promo Collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="mb-6 text-5xl font-bold">
            Promotions Exclusives
          </h1>
          <p className="mb-8 text-xl">
            Profitez de nos offres spéciales sur une sélection de produits
          </p>
          <Button
            asChild
            className="rounded-full bg-[#D4AF37] px-8 py-3 text-lg font-semibold text-white hover:bg-[#C5A227] transition-colors"
          >
            <Link href="#promo-products">
              Voir les Promos
            </Link>
          </Button>
        </div>
      </div>

      {/* Promo Products Grid */}
      <div id="promo-products" className="container mx-auto px-4 py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        )}
      </div>

      {/* Call-to-Action Section */}
      <div className="bg-[#D4AF37] py-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ne Manquez Pas Nos Offres Exclusives
        </h2>
        <p className="text-xl text-white mb-8">
          Inscrivez-vous pour recevoir les dernières promotions et nouveautés
        </p>
        <Button
          asChild
          className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-[#D4AF37] hover:bg-gray-100 transition-colors"
        >
          <Link href="/subscribe">
            S'inscrire Maintenant
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PromoPage;