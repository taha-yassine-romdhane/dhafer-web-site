"use client"

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

interface StockInfo {
  inStockJammel: boolean
  inStockTunis: boolean
  inStockSousse: boolean
  inStockOnline: boolean
  size: string
  colorId: number
}

interface ProductAvailabilityProps {
  productId: number
  selectedSize: string
  selectedColorId: number
  className?: string
  onAvailabilityChange?: (available: boolean, stockData: StockInfo[]) => void
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
  className = "",
  onAvailabilityChange
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
        
        // Check if product is available in any location
        const isAvailable = data.length > 0 && (
          data[0].inStockJammel || 
          data[0].inStockTunis || 
          data[0].inStockSousse || 
          data[0].inStockOnline
        )
        
        // Call the onAvailabilityChange callback if provided
        if (onAvailabilityChange) {
          onAvailabilityChange(isAvailable, data)
        }
      } catch (error) {
        console.error('Error fetching stock:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
        
        // Report unavailability in case of error
        if (onAvailabilityChange) {
          onAvailabilityChange(false, [])
        }
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
      <h3 className="text-sm font-medium text-[#D4AF37]">Disponibilité en magasin</h3>
      <div className="space-y-2">
        {Object.entries(LOCATIONS).map(([key, location]) => {
          // Map location key to the correct boolean field
          let isAvailable = false;
          if (stocks.length > 0) {
            const stock = stocks[0]; // Only one stock record per product/size/color
            if (key === "Jammel") isAvailable = stock.inStockJammel;
            else if (key === "tunis") isAvailable = stock.inStockTunis;
            else if (key === "sousse") isAvailable = stock.inStockSousse;
            else if (key === "online") isAvailable = stock.inStockOnline;
          }
          return (
            <div
              key={key}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                isAvailable 
                  ? "border-[#D4AF37]/20 bg-[#D4AF37]/5" 
                  : "border-gray-200 bg-gray-50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className={cn(
                      "w-4 h-4",
                      isAvailable ? "text-[#D4AF37]" : "text-gray-400"
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
                    ? "bg-[#D4AF37]/10 text-[#D4AF37]" 
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
