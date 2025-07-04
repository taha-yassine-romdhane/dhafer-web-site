"use client"

import { useEffect, useState } from "react"
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client"
import ProductCard from "./ProductCard"
import MobileProductCard from "./MobileProductCard"
import { Loader2 } from "lucide-react"
import { transformProductForMobileCard, isProductValidForMobileCard } from "@/lib/product-utils"

type HomeProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[]
    stocks: Stock[]
  })[]
}

// Create a simplified version of the component to fix hooks issues
export default function TopProduitsSection() {
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Single useEffect for all initialization
  useEffect(() => {
    let isMounted = true;
    
    // Function to fetch products
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/products/home')

        if (!response.ok) {
          throw new Error('Failed to load home products')
        }

        const data = await response.json()
        
        if (isMounted) {
          setProducts(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching home products:', error)
        if (isMounted) {
          setError('Failed to load home products')
          setLoading(false)
        }
      }
    }

    // Function to check if device is mobile
    function checkMobile() {
      if (isMounted) {
        setIsMobile(window.innerWidth < 768)
      }
    }

    // Initialize
    fetchProducts()
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => {
      isMounted = false
      window.removeEventListener('resize', checkMobile)
    }
  }, []) // Empty dependency array - run once on mount

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3f61]" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return null
  }

  // Render product cards
  return (
    <section className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center mb-8">
          <h2 className="text-3xl font-bold text-[#7c3f61] text-center">Notre Nouvelle Collection</h2>
        </div>
        
        <div className={isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"}>
          {products.map((product) => {
            if (isMobile) {
              const transformedProduct = transformProductForMobileCard(product);
              return isProductValidForMobileCard(transformedProduct) ? (
                <MobileProductCard key={product.id} product={transformedProduct} />
              ) : (
                <div key={product.id} className="text-red-500">Invalid product data</div>
              );
            } else {
              return <ProductCard key={product.id} product={product} />;
            }
          })}
        </div>
      </div>
    </section>
  )
}