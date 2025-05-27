"use client"

import { useState } from "react"
import { Product, ColorVariant, ProductImage } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SuggestedProductCardProps {
  product: Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[]
    })[]
  }
}

export default function SuggestedProductCard({ product }: SuggestedProductCardProps) {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // Find main image for each color variant
  const colorVariantsWithMainImages = product.colorVariants.map(variant => {
    const mainImage = variant.images.find(img => img.isMain) || variant.images[0]
    return {
      ...variant,
      mainImage,
    }
  })

  // Get current color variant and its images
  const currentColorVariant = colorVariantsWithMainImages[currentColorIndex]
  const mainImage = currentColorVariant?.mainImage?.url || '/default-image.jpg'

  // Format price
  const formatPrice = (price: number) => {
    return price.toFixed(2) + " TND"
  }

  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/product/${product.id}`} className="block">
        {/* Main Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={mainImage}
            alt={`${product.name} - ${currentColorVariant?.color}`}
            fill
            className="object-cover transform transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            quality={60}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
          />
        </div>

        {/* Product Name and Price (Visible by default) */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-800 line-clamp-1">{product.name}</h3>
          <div className="mt-1">
            {product.salePrice ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 line-through block">{formatPrice(product.price)}</span>
                  <span className="text-xs font-semibold text-[#D4AF37]">{formatPrice(product.salePrice)}</span>
                </div>
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">Promo</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#D4AF37]">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Color Variant Thumbnails 
          {colorVariantsWithMainImages.length > 1 && (
            <div className="mt-2 flex -space-x-2">
              {colorVariantsWithMainImages.slice(0, 3).map((variant, idx) => (
                <div 
                  key={variant.id}
                  className={`relative w-6 h-6 rounded-full overflow-hidden border-2 ${idx === currentColorIndex ? 'border-[#D4AF37] z-10' : 'border-white'}`}
                  style={{ zIndex: 3 - idx }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentColorIndex(idx)
                  }}
                >
                  {variant.mainImage && (
                    <Image
                      src={variant.mainImage.url}
                      alt={variant.color}
                      fill
                      className="object-cover"
                      sizes="24px"
                      quality={30}
                    />
                  )}
                </div>
              ))}
              {colorVariantsWithMainImages.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center" style={{ zIndex: 0 }}>
                  <span className="text-[10px] text-gray-600 font-medium">+{colorVariantsWithMainImages.length - 3}</span>
                </div>
              )}
                
            </div>
          )}
            */}
        </div>
      </Link>
    </div>
  )
}
