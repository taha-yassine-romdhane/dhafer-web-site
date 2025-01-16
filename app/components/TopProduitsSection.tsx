"use client"

import { useEffect, useState } from "react"
import { Product, ColorVariant, ProductImage } from "@prisma/client"
import ProductCard from "./ProductCard"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function TopProduitsSection() {
  const [products, setProducts] = useState<(Product & {
    colorVariants: (ColorVariant & {
      images: ProductImage[]
    })[]
  })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/products/top')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError(error instanceof Error ? error.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-red-500 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-[#D4AF37] hover:underline"
          >
            Réessayer
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos Meilleurs Produits</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection des produits les plus populaires, choisis avec soin pour leur qualité exceptionnelle et leur style unique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-[#D4AF37] rounded-full hover:bg-[#D4AF37]/90 transition-colors"
          >
            Voir Toute la Collection
          </Link>
        </div>
      </div>
    </section>
  )
}