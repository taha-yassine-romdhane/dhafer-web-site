"use client"

import { useState, useEffect, memo, useMemo } from "react"
import { Product, ColorVariant, ProductImage } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useInView } from "react-intersection-observer"

interface SuggestedMobileProductCardProps {
  product: Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[]
    })[]
  }
}

const SuggestedMobileProductCard = ({ product }: SuggestedMobileProductCardProps) => {
  // Use IntersectionObserver to lazy load components
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
    threshold: 0.1,
  })
  
  // Only initialize state when component is in view to save memory
  const [selectedVariant, setSelectedVariant] = useState(() => product.colorVariants[0])
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Maximum number of color variants to show before using the +X indicator
  const MAX_VISIBLE_VARIANTS = 2 // Reduced from 3 to 2 for better mobile performance

  // Memoize image URL calculation to prevent unnecessary recalculations
  const imageUrl = useMemo(() => {
    if (!selectedVariant) return ""
    const mainImage = selectedVariant.images.find(img => img.isMain)
    const firstImage = selectedVariant.images[0]
    return mainImage?.url || firstImage?.url || ""
  }, [selectedVariant])
  
  // Reset image loaded state when variant changes
  useEffect(() => {
    setImageLoaded(false)
  }, [selectedVariant])
  
  // Memoize additional variants calculation
  const additionalVariants = useMemo(() => 
    Math.max(0, product.colorVariants.length - MAX_VISIBLE_VARIANTS),
    [product.colorVariants.length, MAX_VISIBLE_VARIANTS]
  )

  // Memoize price formatting to prevent unnecessary recalculations
  const formattedRegularPrice = useMemo(() => 
    formatPrice(product.price),
    [product.price]
  )
  
  const formattedSalePrice = useMemo(() => 
    product.salePrice ? formatPrice(product.salePrice) : null,
    [product.salePrice]
  )

  // Format price function
  const formatPrice = (price: number) => {
    return price.toFixed(2) + " TND"
  }

  // If not in view, render minimal placeholder to save memory
  if (!inView) {
    return <div ref={ref} className="flex flex-col w-full aspect-[3/4] mb-2" />
  }

  return (
    <div className="flex flex-col w-full">
      {/* Image and Promo Tag */}
      <div ref={ref} className="relative aspect-[3/4] mb-2">
        <Link href={`/product/${product.id}`} prefetch={false}>
          {!imageUrl ? (
            // Simplified skeleton loader
            <div className="w-full h-full bg-gray-200 rounded-lg" />
          ) : (
            <>
              {/* Simplified skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 w-full h-full bg-gray-200 rounded-lg z-10" />
              )}
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className={`object-cover rounded-lg ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, 200px"
                priority={false}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                quality={60}
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

      {/* Product Info - Simplified for better performance */}
      <div className="flex flex-col gap-1">
        {/* Product Name */}
        <Link href={`/product/${product.id}`} prefetch={false}>
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
        </Link>
        
        {/* Price - Using pre-calculated formatted prices */}
        <div className="flex flex-col">
          {formattedSalePrice ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formattedRegularPrice}
              </span>
              <span className="text-sm font-semibold text-[#D4AF37]">
                {formattedSalePrice}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[#D4AF37]">
              {formattedRegularPrice}
            </span>
          )}
        </div>

        {/* Color Variant Images - Only render if more than one variant */}
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
                  className={`relative w-5 h-5 rounded-full overflow-hidden border ${selectedVariant?.id === variant.id ? "border-[#D4AF37]" : "border-gray-200"}`}
                  aria-label={`Select ${variant.color} color`}
                >
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${variantImage.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
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

export default memo(SuggestedMobileProductCard)
