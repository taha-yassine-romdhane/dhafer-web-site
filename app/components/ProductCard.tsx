"use client"

import { useState, useEffect, useRef } from "react"
import { Product, ColorVariant, ProductImage } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"


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
  const [isMobile, setIsMobile] = useState(false)
  const [showColorSelector, setShowColorSelector] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Find main image for each color variant and add hex color code
  const colorVariantsWithMainImages = product.colorVariants.map(variant => {
    const mainImage = variant.images.find(img => img.isMain) || variant.images[0]
    return {
      ...variant,
      mainImage,
    }
  })

  // Get current color variant and its images
  const currentColorVariant = colorVariantsWithMainImages[currentColorIndex]
  const images = currentColorVariant?.images || []
  const currentImage = images[currentImageIndex]?.url || ''

  // Auto-advance images on hover
  useEffect(() => {
    if (isHovering && images.length > 1 && !isMobile) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length)
      }, 2000)
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
    }
  }, [isHovering, images.length, isMobile])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => {
    setIsHovering(false)
    // Reset to main image when mouse leaves
    const mainImageIndex = images.findIndex(img => img.isMain)
    setCurrentImageIndex(mainImageIndex !== -1 ? mainImageIndex : 0)
  }


  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="block">
        {/* Main Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {!currentImage ? (
            // Skeleton loader when image is not available
            <div className="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            </div>
          ) : (
            <Link href={`/product/${product.id}`}>
              <Image
                src={currentImage}
                alt={`${product.name} - ${currentColorVariant?.color}`}
                fill
                className="object-cover transform transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={currentImageIndex === 0} // Only prioritize the first image
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
              />
            </Link>
          )}

          {/* Mobile Navigation Controls */}
          {isMobile && images.length > 1 && (
            <div className="absolute inset-x-0 inset-y-0 flex items-center justify-between px-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
                }}
                className="bg-white/80 rounded-full p-1.5 z-10 hover:bg-white/90 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentImageIndex((prev) => (prev + 1) % images.length)
                }}
                className="bg-white/80 rounded-full p-1.5 z-10 hover:bg-white/90 active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-gray-800" />
              </button>
            </div>
          )}

          {/* Image Position Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentImageIndex(idx)
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white scale-125' : 'bg-white/50'}`}
                  aria-label={`Voir image ${idx + 1}`}
                />
              ))}
            </div>
          )}
          {/* Sale Badge */}
          {product.salePrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold z-10">
              -{Math.round((1 - product.salePrice / product.price) * 100)}%
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3">
          <h3 className="text-base font-semibold line-clamp-1">{product.name}</h3>
          
          {/* Price */}
          <div className="mt-1.5 flex items-baseline space-x-2">
            {product.salePrice ? (
              <>
                <span className="text-base font-bold text-[#7c3f61]">
                  {product.salePrice.toFixed(2)} TND
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {product.price.toFixed(2)} TND
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-[#7c3f61]">
                {product.price.toFixed(2)} TND
              </span>
            )}
          </div>

          {/* See More Details Button */}
          <div className="mt-3">
            <Link href={`/product/${product.id}`} className="block">
              <button className="w-full py-2 px-4 bg-[#7c3f61] hover:bg-[#7c3f61]/80 text-white rounded-md transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow">
                Acheter
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Color Selector Modal */}
      {showColorSelector && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault()
            setShowColorSelector(false)
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium text-gray-800">{product.name}</h3>
              <button 
                onClick={() => setShowColorSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Sélectionner la couleur</h4>
              <div className="grid grid-cols-2 gap-3">
                {colorVariantsWithMainImages.map((variant, index) => (
                  <button
                    key={variant.id}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${currentColorIndex === index ? 'border-[#7c3f61] shadow-md' : 'border-transparent hover:border-gray-300'}`}
                    onClick={() => {
                      setCurrentColorIndex(index)
                      setCurrentImageIndex(0)
                      setShowColorSelector(false)
                    }}
                  >
                    <div className="relative aspect-square">
                      {variant.mainImage && (
                        <Image
                          src={variant.mainImage.url}
                          alt={variant.color}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      )}
                    </div>
                    <div className="p-2 flex items-center bg-gray-50">
                      <span className="text-sm capitalize">{variant.color}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}