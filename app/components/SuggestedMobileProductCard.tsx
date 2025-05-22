"use client"

import { useState, useEffect } from "react"
import { Product, ColorVariant, ProductImage } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

interface SuggestedMobileProductCardProps {
  product: Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[]
    })[]
  }
}

export default function SuggestedMobileProductCard({ product }: SuggestedMobileProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.colorVariants[0])
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Maximum number of color variants to show before using the +X indicator
  const MAX_VISIBLE_VARIANTS = 2

  // Get the main image from the selected variant
  const mainImage = selectedVariant?.images.find(img => img.isMain)
  const firstImage = selectedVariant?.images[0]
  const imageUrl = mainImage?.url || firstImage?.url || ""
  
  // Reset image loaded state when variant changes
  useEffect(() => {
    setImageLoaded(false)
  }, [selectedVariant])
  
  // Calculate how many additional variants are not shown
  const additionalVariants = Math.max(0, product.colorVariants.length - MAX_VISIBLE_VARIANTS)

  const formatPrice = (price: number) => {
    return price.toFixed(2) + " TND"
  }

  return (
    <div className="flex flex-col w-full">
      {/* Image and Promo Tag */}
      <div className="relative aspect-[3/4] mb-2">
        <Link href={`/product/${product.id}`}>
          {!imageUrl ? (
            <div className="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            </div>
          ) : (
            <>
              {/* Skeleton loader shown until image loads */}
              {!imageLoaded && (
                <div className="absolute inset-0 w-full h-full animate-pulse bg-gray-200 flex items-center justify-center rounded-lg z-10">
                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className={`object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 768px) 50vw"
                priority={false}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              {product.salePrice && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded z-20">
                  Promo
                </div>
              )}
            </>
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
        <div className="flex flex-col">
          {product.salePrice ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-[#D4AF37]">
                {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[#D4AF37]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Color Variant Images */}
        {product.colorVariants.length > 1 && (
          <div className="flex items-center gap-1 mt-1">
            {/* Show only the first MAX_VISIBLE_VARIANTS color variants */}
            {product.colorVariants.slice(0, MAX_VISIBLE_VARIANTS).map((variant) => {
              const variantImage = variant.images.find(img => img.isMain) || variant.images[0]
              if (!variantImage) return null
              
              return (
                <button
                  key={variant.id}
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedVariant(variant)
                  }}
                  className={`relative w-5 h-5 rounded-full overflow-hidden border transition-all duration-200 ${
                    selectedVariant?.id === variant.id 
                      ? "border-[#D4AF37] scale-110" 
                      : "border-gray-200"
                  }`}
                  aria-label={`Select ${variant.color} color`}
                >
                  <Image
                    src={variantImage.url}
                    alt={variant.color}
                    fill
                    className="object-cover"
                    sizes="20px"
                    loading="lazy"
                  />
                </button>
              )
            })}
            
            {/* Show +X indicator if there are additional variants */}
            {additionalVariants > 0 && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                +{additionalVariants}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
