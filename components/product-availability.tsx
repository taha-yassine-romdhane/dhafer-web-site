"use client"

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

interface StockInfo {
  location: string
  quantity: number
  size: string
  colorId: number
}

interface ProductAvailabilityProps {
  productId: number
  selectedSize: string
  selectedColorId: number
  className?: string
}

const LOCATIONS = {
  Jammel: {
    name: "Jammel",
    address: "105 Av. Habib Bourguiba, Jammel"
  },
  tunis: {
    name: "Tunis",
    address: "40 Av. Fattouma Bourguiba, Tunis"
  },
  sousse: {
    name: "Sousse",
    address: "Avenue Khezama, Sousse"
  },
  online: {
    name: "En ligne",
    address: "Livraison disponible"
  }
}

export function ProductAvailability({ 
  productId, 
  selectedSize, 
  selectedColorId,
  className = "" 
}: ProductAvailabilityProps) {
  const [stocks, setStocks] = useState<StockInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      // Reset states
      setError(null)
      setLoading(true)
      setStocks([])

      try {
        // Validate inputs
        if (!productId || !selectedSize || !selectedColorId) {
          setLoading(false)
          return
        }

        const response = await fetch(
          `/api/products/${productId}/stock?size=${encodeURIComponent(selectedSize)}&colorId=${selectedColorId}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock information')
        }
        
        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format')
        }
        
        setStocks(data)
      } catch (error) {
        console.error('Error fetching stock:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [productId, selectedSize, selectedColorId])

  if (!productId || !selectedSize || !selectedColorId) {
    return null
  }

  if (error) {
    return (
      <div className={cn("p-4 text-sm text-red-500 bg-red-50 rounded-lg", className)}>
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn("space-y-4 animate-pulse", className)}>
        {Object.keys(LOCATIONS).map((loc) => (
          <div key={loc} className="h-16 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-[#7c3f61]">Disponibilité en magasin</h3>
      <div className="space-y-2">
        {Object.entries(LOCATIONS).map(([key, location]) => {
          const stockInfo = stocks.find(s => s.location === key)
          const isAvailable = stockInfo && stockInfo.quantity > 0

          return (
            <div
              key={key}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                isAvailable 
                  ? "border-[#7c3f61]/20 bg-[#7c3f61]/5" 
                  : "border-gray-200 bg-gray-50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className={cn(
                      "w-4 h-4",
                      isAvailable ? "text-[#7c3f61]" : "text-gray-400"
                    )} />
                    <span className="font-medium">
                      {location.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {location.address}
                  </p>
                </div>
                <div className={cn(
                  "px-2 py-1 text-sm rounded",
                  isAvailable 
                    ? "bg-[#7c3f61]/10 text-[#7c3f61]" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  {isAvailable ? "En stock" : "Indisponible"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
