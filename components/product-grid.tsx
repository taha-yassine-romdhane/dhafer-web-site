"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, ProductImage, ColorVariant } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithColorVariants[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: string }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addItem } = useCart();

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
      setDialogOpen(true);
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

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-md mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product.id.toString())}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Main Product Image */}
              <div
                className="relative aspect-[2/3] mb-2 overflow-hidden rounded-md bg-gray-100 cursor-pointer"
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
              <div className="text-gray-700">
                <h3 className="text-sm font-semibold">{product.name}</h3>
                <div className="mt-1">
                  {product.salePrice ? (
                    <p className="text-xs text-gray-500 line-through">{formatPrice(product.price)} TND</p>
                  ) : (
                    <p className="text-xs text-[#D4AF37] -700">{formatPrice(product.price)} TND</p>
                  )}
                  {product.salePrice && (
                    <p className="text-xs text-[#D4AF37] mt-600 font-semibold"><span className="text-red-600 mr-1">Promo :</span> {formatPrice(product.salePrice)} TND</p>
                  )}
                </div>
              </div>

              {/* Color Options */}
              <div className="mt-1 flex gap-1.5">
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
                        "w-6 h-6 rounded-full border-2 relative overflow-hidden group",
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
                            sizes="24px"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Size Options */}
              <div className="mt-1 flex flex-wrap gap-1">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                    className={cn(
                      "px-1 py-0.5 text-xs rounded border",
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
      )}
      
      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>Veuillez sélectionner une taille et une couleur</DialogTitle>
          <DialogDescription>
            Vous devez sélectionner une taille et une couleur avant d'ajouter ce produit au panier.
          </DialogDescription>
          <Button onClick={() => setDialogOpen(false)} className="bg-[#D4AF37] hover:bg-[#B59851] text-white">
            D'accord
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGrid;