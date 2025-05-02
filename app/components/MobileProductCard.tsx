"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { cn } from "@/lib/utils";

type MobileProductCardProps = {
  product: Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[];
      stocks: Stock[];
    })[];
    sizes: string[];
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
              Promo
            </div>
          )}

      
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
        </Link>
        
        {/* Price */}
        <div className="flex flex-col">
          {product.salePrice ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-red-500">
                Promo: {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Color Variant Images */}
        <div className="flex gap-1 mt-1">
          {product.colorVariants.map((variant) => {
            const variantImage = variant.images.find(img => img.isMain) || variant.images[0];
            if (!variantImage) return null;
            
            return (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={cn(
                  "relative w-6 h-6 rounded-full overflow-hidden border transition-all duration-200",
                  selectedVariant?.id === variant.id 
                    ? "border-[#D4AF37] scale-110" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Image
                  src={variantImage.url}
                  alt={variant.color}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </button>
            );
          })}
        </div>

        {/* Size Options */}
        <div className="flex gap-2 mt-1">
          {product.sizes.map((size) => (
            <span key={size} className="text-xs text-gray-600 uppercase">
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
