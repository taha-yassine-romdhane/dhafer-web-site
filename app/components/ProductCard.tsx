"use client"

import { useState } from "react"
import { Product, ColorVariant, ProductImage } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[]
    })[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Get current color variant and its images
  const currentColorVariant = product.colorVariants[currentColorIndex]
  const images = currentColorVariant?.images || []
  const currentImage = images[currentImageIndex]?.url || '/default-image.jpg'

  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setCurrentImageIndex(0)
      }}
    >
      <Link href={`/product/${product.id}`}>
        {/* Main Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={currentImage}
            alt={`${product.name} - ${currentColorVariant?.color}`}
            fill
            className="object-cover transform transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />

          {/* Thumbnail Gallery - Left Side */}
          {isHovered && images.length > 1 && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-16 h-20 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                    currentImageIndex === index 
                      ? 'border-[#D4AF37] scale-110' 
                      : 'border-white/50 hover:border-[#D4AF37] hover:scale-105'
                  }`}
                  onMouseEnter={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Color Variants - Right Side */}
          {isHovered && product.colorVariants.length > 1 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.colorVariants.map((variant, index) => (
                <button
                  key={variant.id}
                  className={`relative w-16 h-20 overflow-hidden rounded-md transition-all duration-200 ${
                    currentColorIndex === index 
                      ? 'ring-2 ring-[#D4AF37] ring-offset-2 scale-110' 
                      : 'ring-1 ring-white/50 hover:ring-[#D4AF37] hover:scale-105'
                  }`}
                  onMouseEnter={() => {
                    setCurrentColorIndex(index)
                    setCurrentImageIndex(0)
                  }}
                >
                  <Image
                    src={variant.images[0]?.url || '/default-image.jpg'}
                    alt={`${product.name} - ${variant.color}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1">
                    <p className="text-xs text-white text-center capitalize">
                      {variant.color}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sale Badge */}
          {product.salePrice && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              -{Math.round((1 - product.salePrice / product.price) * 100)}%
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>

          {/* Price */}
          <div className="mt-3 flex items-baseline space-x-2">
            {product.salePrice ? (
              <>
                <span className="text-xl font-bold text-[#D4AF37]">
                  {product.salePrice.toFixed(2)} TND
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toFixed(2)} TND
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-[#D4AF37]">
                {product.price.toFixed(2)} TND
              </span>
            )}
          </div>

          {/* Current Color Name */}
          <div className="mt-2 text-sm text-gray-600">
            Couleur: <span className="font-medium capitalize">{currentColorVariant?.color}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}