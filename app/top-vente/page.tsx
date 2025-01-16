"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const TopVentePage = () => {
  const bestSellers = [
    {
      id: 1,
      name: "Caftan Doré",
      price: "450 TND",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=715&q=80",
      href: "/products/caftan-dore",
    },
    {
      id: 2,
      name: "Abaya Luxe",
      price: "350 TND",
      image: "https://images.unsplash.com/photo-1618354691551-5d1a5a5f5f5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=715&q=80",
      href: "/products/abaya-luxe",
    },
    {
      id: 3,
      name: "Robe Soirée Élégante",
      price: "600 TND",
      image: "https://images.unsplash.com/photo-1618354691551-5d1a5a5f5f5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=715&q=80",
      href: "/products/robe-soiree",
    },
    {
      id: 4,
      name: "Jebba Traditionnelle",
      price: "400 TND",
      image: "https://images.unsplash.com/photo-1618354691551-5d1a5a5f5f5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=715&q=80",
      href: "/products/jebba-traditionnelle",
    },
  ];

  return (
    <div className="bg-[#FFF8E1] min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516041774595-cc1b7969480c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Gold-themed background image
            alt="Top Vente Collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="mb-6 text-5xl font-bold">
            Nos Meilleures Ventes
          </h1>
          <p className="mb-8 text-xl">
            Découvrez les produits les plus populaires de notre collection
          </p>
          <Button
            asChild
            className="rounded-full bg-[#D4AF37] px-8 py-3 text-lg font-semibold text-white hover:bg-[#C5A227] transition-colors"
          >
            <Link href="#top-vente-products">
              Voir les Produits
            </Link>
          </Button>
        </div>
      </div>

      {/* Best Sellers Grid */}
      <div id="top-vente-products" className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-[#D4AF37] mb-8">
          Nos Meilleures Ventes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-lg text-[#D4AF37] font-bold mt-2">
                  {product.price}
                </p>
                <Button
                  asChild
                  className="w-full mt-4 bg-[#D4AF37] hover:bg-[#C5A227] text-white"
                >
                  <Link href={product.href}>Acheter Maintenant</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="bg-[#D4AF37] py-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ne Manquez Pas Nos Nouveautés
        </h2>
        <p className="text-xl text-white mb-8">
          Inscrivez-vous pour être informé des dernières tendances
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

export default TopVentePage;