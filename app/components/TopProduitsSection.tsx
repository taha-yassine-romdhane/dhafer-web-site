"use client"

import { useEffect, useState } from "react"
import { Product, ColorVariant, ProductImage, Stock } from "@prisma/client"
import ProductCard from "./ProductCard"
import MobileProductCard from "./MobileProductCard"
import { Loader2 } from "lucide-react"
import Link from "next/link"

type HomeProduct = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[]
    stocks: Stock[]
  })[]
}

export default function TopProduitsSection() {
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/products/home')

        if (!response.ok) {
          throw new Error('Failed to load home products')
        }

        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching home products:', error)
        setError('Failed to load home products')
      } finally {
        setLoading(false)
      }
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    fetchHomeProducts()
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3f61]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
        </div>
        
        <div className={isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
          {products.map((product) => (
            isMobile ? (
              <MobileProductCard key={product.id} product={product} />
            ) : (
              <ProductCard key={product.id} product={product} />
            )
          ))}
        </div>
      </div>
    </section>
  )
}