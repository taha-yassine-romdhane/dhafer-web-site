"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, ProductImage, ColorVariant, Stock } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle,  DialogFooter } from "@/components/ui/dialog";

interface ProductWithColorVariants extends Product {
  images: ProductImage[];
  colorVariants: (ColorVariant & {
    images: ProductImage[];
  })[];
}

interface StockInfo {
  [productId: string]: {
    [colorId: string]: {
      [size: string]: boolean;
    };
  };
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
  const [currentProduct, setCurrentProduct] = useState<ProductWithColorVariants | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo>({});
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

        // Fetch stock information for each product
        const stockData: StockInfo = {};
        await Promise.all(data.map(async (product: ProductWithColorVariants) => {
          const stockResponse = await fetch(`/api/products/${product.id}/stock`);
          if (stockResponse.ok) {
            const stocks = await stockResponse.json();
            
            // Initialize stock data structure for this product
            stockData[product.id] = {};
            
            // Process stock data
            stocks.forEach((stock: Stock) => {
              if (!stockData[product.id][stock.colorId]) {
                stockData[product.id][stock.colorId] = {};
              }
              stockData[product.id][stock.colorId][stock.size] = stock.inStock;
            });
          }
        }));
        
        setStockInfo(stockData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters]);

  // Check if a color has any sizes in stock
  const isColorInStock = (productId: number, colorId: number) => {
    if (!stockInfo[productId] || !stockInfo[productId][colorId]) {
      return true; // Default to true if we don't have stock info yet
    }
    
    // Check if any size for this color is in stock
    return Object.values(stockInfo[productId][colorId]).some(inStock => inStock);
  };

  // Check if a specific size is in stock for a color
  const isSizeInStock = (productId: number, colorId: number, size: string) => {
    if (!stockInfo[productId] || !stockInfo[productId][colorId]) {
      return true; // Default to true if we don't have stock info yet
    }
    
    return stockInfo[productId][colorId][size] === true;
  };

  const handleAddToCart = (product: ProductWithColorVariants) => {
    // Set the current product for the dialog
    setCurrentProduct(product);
    
    // If a color is already selected, use it, otherwise default to the first color
    if (!selectedColors[product.id] && product.colorVariants.length > 0) {
      const firstVariant = product.colorVariants[0];
      setSelectedColors({ ...selectedColors, [product.id]: firstVariant.color });
      
      const mainImage = firstVariant.images.find(img => img.isMain)?.url || firstVariant.images[0]?.url;
      if (mainImage) {
        setSelectedImage({ ...selectedImage, [product.id]: mainImage });
      }
    }
    
    // Open the dialog to select size
    setDialogOpen(true);
  };

  const confirmAddToCart = () => {
    if (!currentProduct || !selectedColors[currentProduct.id] || !selectedSizes[currentProduct.id]) {
      return;
    }

    // Find the selected color variant and its images
    const selectedColorVariant = currentProduct.colorVariants.find(
      variant => variant.color === selectedColors[currentProduct.id]
    );

    if (!selectedColorVariant) {
      console.error('Selected color variant not found');
      return;
    }

    // Create a modified product with the correct images
    const productWithImages = {
      ...currentProduct,
      images: selectedColorVariant.images
    };

    addItem(
      productWithImages,
      selectedSizes[currentProduct.id],
      selectedColors[currentProduct.id]
    );
    
    // Close the dialog
    setDialogOpen(false);
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
                    priority={products.indexOf(product) < 4} // Add priority to first 4 products
                    loading={products.indexOf(product) < 4 ? "eager" : "lazy"}
                    onError={(e) => {
                      // Fallback to first image if available or placeholder
                      const target = e.target as HTMLImageElement;
                      const fallbackImg = product.images[0]?.url || '/placeholder-image.jpg';
                      if (target.src !== fallbackImg) {
                        target.src = fallbackImg;
                      }
                    }}
                    quality={75}
                  />
                )}
                
                {/* Promo Badge */}
                {product.salePrice && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                    Promo
                  </div>
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
                    className="bg-white text-black hover:bg-gray-100 bg-gray-200 text-gray-900 hover:bg-[#7c3f61] hover:text-white"
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
                    <p className="text-xs text-[#7c3f61] -700">{formatPrice(product.price)} TND</p>
                  )}
                  {product.salePrice && (
                    <p className="text-xs text-[#7c3f61] mt-600 font-semibold"><span className="text-red-600 mr-1">Promo :</span> {formatPrice(product.salePrice)} TND</p>
                  )}
                </div>
              </div>

              {/* Color Options */}
              <div className="mt-1 flex gap-1.5">
                {product.colorVariants.map((variant) => {
                  const variantMainImage = variant.images.find(img => img.isMain)?.url || variant.images[0]?.url;
                  const colorInStock = isColorInStock(product.id, variant.id);
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (colorInStock) {
                          setSelectedColors({ ...selectedColors, [product.id]: variant.color });
                          if (variantMainImage) {
                            setSelectedImage({ ...selectedImage, [product.id]: variantMainImage });
                          }
                        }
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 relative overflow-hidden group",
                        selectedColors[product.id] === variant.color
                          ? "border-[#7c3f61] ring-2 ring-[#7c3f61] ring-offset-1"
                          : colorInStock 
                            ? "border-transparent hover:border-gray-300" 
                            : "border-transparent opacity-50 cursor-not-allowed"
                      )}
                      aria-label={variant.color}
                      disabled={!colorInStock}
                    >
                      {variantMainImage && (
                        <div className="absolute inset-[-50%] w-[200%] h-[200%]">
                          <Image
                            src={variantMainImage}
                            alt={`${product.name} in ${variant.color}`}
                            fill
                            className={cn(
                              "object-cover transition-transform duration-200 scale-150 group-hover:scale-170",
                              !colorInStock && "opacity-50"
                            )}
                            sizes="24px"
                          />
                        </div>
                      )}
                      {!colorInStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                          <span className="text-[8px] font-bold text-red-600">OUT</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Updated Dialog with Size Selection */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Veuillez sélectionner une taille</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Product Image */}
            {currentProduct && selectedImage[currentProduct.id] && (
              <div className="relative aspect-square rounded-md overflow-hidden">
                <Image
                  src={selectedImage[currentProduct.id]}
                  alt={currentProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority={true}
                  loading="eager"
                  onError={(e) => {
                    // Fallback to first image if available or placeholder
                    const target = e.target as HTMLImageElement;
                    const fallbackImg = currentProduct.images[0]?.url || '/placeholder-image.jpg';
                    if (target.src !== fallbackImg) {
                      target.src = fallbackImg;
                    }
                  }}
                  quality={75}
                />
              </div>
            )}
            
            {/* Product Info and Size Selection */}
            <div className="flex flex-col justify-between">
              {currentProduct && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{currentProduct.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{currentProduct.description.split('\n')[0]}</p>
                    
                    {/* Price */}
                    <div className="mt-2">
                      {currentProduct.salePrice ? (
                        <>
                          <p className="text-xs text-gray-500 line-through">{formatPrice(currentProduct.price)} TND</p>
                          <p className="text-sm text-[#7c3f61] font-semibold">
                            <span className="text-red-600 mr-1">Promo :</span> {formatPrice(currentProduct.salePrice)} TND
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-[#7c3f61]">{formatPrice(currentProduct.price)} TND</p>
                      )}
                    </div>
                    
                    {/* Selected Color */}
                    {selectedColors[currentProduct.id] && (
                      <div className="mt-2">
                        <p className="text-sm">
                          Couleur: <span className="font-medium capitalize">{selectedColors[currentProduct.id]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Size Options */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Sélectionnez une taille:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.sizes.map((size) => {
                        const selectedColorVariant = currentProduct.colorVariants.find(
                          variant => variant.color === selectedColors[currentProduct.id]
                        );
                        const sizeInStock = selectedColorVariant 
                          ? isSizeInStock(currentProduct.id, selectedColorVariant.id, size)
                          : false;
                        
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              if (sizeInStock) {
                                setSelectedSizes({ ...selectedSizes, [currentProduct.id]: size });
                              }
                            }}
                            className={cn(
                              "px-3 py-1 text-sm rounded border",
                              selectedSizes[currentProduct.id] === size
                                ? "border-[#7c3f61] bg-[#7c3f61] text-white"
                                : sizeInStock
                                  ? "border-gray-200 hover:border-gray-300"
                                  : "border-gray-200 opacity-50 cursor-not-allowed"
                            )}
                            disabled={!sizeInStock}
                          >
                            {size}
                            {!sizeInStock && (
                              <span className="ml-1 text-xs text-red-500">•</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setDialogOpen(false)} 
              variant="outline" 
              className="mr-2"
            >
              Annuler
            </Button>
            <Button 
              onClick={confirmAddToCart} 
              className="bg-[#7c3f61] hover:bg-[#7c3f61]/80 text-white"
              disabled={!currentProduct || !selectedSizes[currentProduct?.id]}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGrid;