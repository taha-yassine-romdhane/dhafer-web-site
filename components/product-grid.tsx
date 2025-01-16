"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Product, ProductImage, ColorVariant } from "@prisma/client"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

const colorMap: { [key: string]: string } = {
  // Basic Colors
  White: "#FFFFFF",
  Black: "#000000",
  Red: "#FF0000",
  Blue: "#0000FF",
  Green: "#008000",
  Yellow: "#FFFF00",
  Purple: "#800080",
  Orange: "#FFA500",
  Pink: "#FFC0CB",
  Brown: "#A52A2A",
  Gray: "#808080",
  Greyish: "#9E9E9E",
  rouge: "#FF0000",
  blue: "#0000FF",
  noire: "#000000",
};

interface ProductWithColorVariants extends Product {
  images: ProductImage[];
  colorVariants: (ColorVariant & {
    images: ProductImage[];
  })[];
}

interface ProductGridProps {
  filters: {
    category: string;
    collaborator: string;
    sort: string;
    product: string;
  };
}

const ProductGrid = ({ filters }: ProductGridProps) => {
  const router = useRouter()
  const [products, setProducts] = useState<ProductWithColorVariants[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({})
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({})
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: string }>({})
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();
        if (filters.category !== 'all') params.append('category', filters.category);
        if (filters.collaborator !== 'all') params.append('collaborateur', filters.collaborator);
        if (filters.sort !== 'featured') params.append('sort', filters.sort);
        if (filters.product) params.append('product', filters.product);

        const response = await fetch('/api/products?' + params.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);

        const initialSelectedImages: { [key: string]: string } = {};
        data.forEach((product: ProductWithColorVariants) => {
          // Find the first color variant and its main image
          const firstVariant = product.colorVariants[0];
          if (firstVariant) {
            const mainImage = firstVariant.images.find(img => img.isMain)?.url || firstVariant.images[0]?.url;
            if (mainImage) {
              initialSelectedImages[product.id] = mainImage;
            }
          }
        });
        setSelectedImage(initialSelectedImages);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters]);

  const handleAddToCart = (product: ProductWithColorVariants) => {
    if (!selectedColors[product.id] || !selectedSizes[product.id]) {
      alert('Please select both size and color');
      return;
    }

    // Find the selected color variant and its images
    const selectedColorVariant = product.colorVariants.find(
      variant => variant.color === selectedColors[product.id]
    );

    if (!selectedColorVariant) {
      console.error('Selected color variant not found');
      return;
    }

    // Create a modified product with the correct images
    const productWithImages = {
      ...product,
      images: selectedColorVariant.images
    };
    
    addItem(
      productWithImages,
      selectedSizes[product.id],
      selectedColors[product.id]
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative"
          onMouseEnter={() => setHoveredProduct(product.id.toString())}
          onMouseLeave={() => setHoveredProduct(null)}
        >
          {/* Main Product Image */}
          <div 
            className="relative aspect-[2/3] mb-3 overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
            onClick={() => router.push(`/product/${product.id}`)}
          >
            {selectedImage[product.id] && (
              <Image
                src={selectedImage[product.id]}
                alt={product.name}
                fill
                className="object-cover object-center transition-opacity duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Quick Add Overlay */}
            <div className={cn(
              "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300",
              hoveredProduct === product.id.toString() && "opacity-100"
            )}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="bg-white text-black hover:bg-gray-100 bg-gray-200 text-gray-900 hover:bg-[#D4AF37] hover:text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2 " />
                Ajout Rapide
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{formatPrice(product.price)} TND</p>
          </div>

          {/* Color Options */}
          <div className="mt-2 flex gap-1.5">
            {product.colorVariants.map((variant) => {
              const variantMainImage = variant.images.find(img => img.isMain)?.url || variant.images[0]?.url;
              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedColors({ ...selectedColors, [product.id]: variant.color });
                    if (variantMainImage) {
                      setSelectedImage({ ...selectedImage, [product.id]: variantMainImage });
                    }
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 relative overflow-hidden group",
                    selectedColors[product.id] === variant.color
                      ? "border-[#D4AF37] ring-2 ring-[#D4AF37] ring-offset-1"
                      : "border-transparent hover:border-gray-300"
                  )}
                  aria-label={variant.color}
                >
                  {variantMainImage && (
                    <div className="absolute inset-[-50%] w-[200%] h-[200%]">
                      <Image
                        src={variantMainImage}
                        alt={`${product.name} in ${variant.color}`}
                        fill
                        className="object-cover transition-transform duration-200 scale-150 group-hover:scale-170"
                        sizes="40px"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Size Options */}
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                className={cn(
                  "px-2 py-1 text-xs rounded border",
                  selectedSizes[product.id] === size
                    ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
