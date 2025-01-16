"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const PromoPage = () => {
  const promoProducts = [
    {
      id: 1,
      name: "Caftan Doré",
      price: "299.99TND",
      discount: "30% OFF",
      image: "/caftan-dore.jpg",
      href: "/products/caftan-dore",
    },
    {
      id: 2,
      name: "Abaya Luxe",
      price: "199.99TDN",
      discount: "25% OFF",
      image: "/abaya-luxe.jpg",
      href: "/products/abaya-luxe",
    },
    {
      id: 3,
      name: "Robe Soirée Élégante",
      price: "399.99TND",
      discount: "20% OFF",
      image: "/robe-soiree.jpg",
      href: "/products/robe-soiree",
    },
    {
      id: 4,
      name: "Jebba Traditionnelle",
      price: "249.99TND",
      discount: "15% OFF",
      image: "/jebba-traditionnelle.jpg",
      href: "/products/jebba-traditionnelle",
    },
  ];

  return (
    <div className="bg-[#FFF8E1] min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1572584642822-6f8de0243c93?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Replace with a gold-themed background image
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promoProducts.map((product) => (
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
                <div className="absolute top-2 right-2 bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm">
                  {product.discount}
                </div>
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