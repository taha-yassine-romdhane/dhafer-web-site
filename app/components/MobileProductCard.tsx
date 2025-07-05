"use client";

import { useState } from "react";
import Link from "next/link";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import Image from "next/image";

type MobileProductCardProps = {
  product: Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[];
      stocks: Stock[];
    })[];
  };
};

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.colorVariants[0]);
  const [isHovered, setIsHovered] = useState(false);

  // Get the main image from the selected variant
  const mainImage = selectedVariant?.images.find(img => img.isMain);
  const firstImage = selectedVariant?.images[0];
  const imageUrl = mainImage?.url || firstImage?.url || "/placeholder.png";

  const formatPrice = (price: number) => {
    return price.toFixed(2) + " TND";
  };

  // Calculate discount percentage if there's a sale price
  const discountPercentage = product.salePrice && product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  return (
    <div className="flex flex-col w-full">
      {/* Image and Promo Tag */}
      <div 
        className="relative aspect-[3/4] mb-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/product/${product.id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 50vw"
            priority={false}
          />
          {product.salePrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
              -{discountPercentage}%
            </div>
          )}

      
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-[#7c3f61]">
                {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
          )}
        </div>       
        {/* See More Details Button */}
        <div className="mt-3">
          <Link href={`/product/${product.id}`} className="block">
            <button className="w-full py-2 px-3 bg-[#7c3f61] hover:hover:bg-[#7c3f61]/80 text-white rounded-md transition-colors duration-200 text-xs font-medium shadow-sm hover:shadow">
              Acheter
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
