"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, ProductImage, ColorVariant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface ProductCategory {
  categoryId: number;
  category?: Category;
}

interface ProductWithColorVariants extends Product {
  images: ProductImage[];
  colorVariants: (ColorVariant & {
    images: ProductImage[];
  })[];
  categories?: ProductCategory[];
}

interface ProductGridProps {
  filters: {
    category: string;
    collaborator: string;
    sort: string;
    product: string;
    group: string | null;
    searchQuery?: string;
    page?: number;
  };
  productsPerPage?: number;
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (totalPages: number) => void;
}

const ProductGrid = ({ filters, productsPerPage = 12, onPageChange, onTotalPagesChange }: ProductGridProps) => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithColorVariants[] | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithColorVariants[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: string }>({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: filters.page || 1,
    limit: productsPerPage,
    totalPages: 0
  });
  // No longer need dialog or cart context for quick add
  // const [dialogOpen, setDialogOpen] = useState(false);
  // const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // Filter products based on search query
  useEffect(() => {
    if (!products) return;
    
    if (!filters.searchQuery) {
      setFilteredProducts(products);
      return;
    }
    
    const query = filters.searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      // Get categories from product if available
      const categories = product.categories?.map((cat: ProductCategory) => cat.category?.name || '').join(' ') || '';
      
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        categories.toLowerCase().includes(query) ||
        (product.collaborateur || '').toLowerCase().includes(query)
      );
    });
    
    setFilteredProducts(filtered);
  }, [products, filters.searchQuery]);

  useEffect(() => {
    // Track if the component is still mounted
    let isMounted = true;
    
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        // Handle category parameter
        if (filters.category && filters.category !== 'all' && filters.category !== 'Tous') {
          params.append('category', filters.category);
        }
        
        // Handle group parameter
        if (filters.group) {
          params.append('group', filters.group);
        }
        
        // Handle collaborator parameter
        if (filters.collaborator && filters.collaborator !== 'all') {
          params.append('collaborateur', filters.collaborator);
        }
        
        // Handle sort parameter
        if (filters.sort && filters.sort !== 'featured') {
          params.append('sort', filters.sort);
        }
        
        // Handle product parameter
        if (filters.product) {
          params.append('product', filters.product);
        }
        
        // Add pagination parameters - always include these
        params.append('page', String(filters.page || pagination.page));
        params.append('limit', String(pagination.limit));

        console.log('Fetching products with params:', params.toString());
        const response = await fetch('/api/products?' + params.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log('API response:', data);
        
        // Process in batches to prevent UI freezing
        if (isMounted) {
          // Check if pagination data exists
          if (data.pagination) {
            console.log('Pagination data:', data.pagination);
            setPagination(data.pagination);
            
            // Notify parent component of total pages
            if (onTotalPagesChange) {
              console.log('Notifying parent of total pages:', data.pagination.totalPages);
              onTotalPagesChange(data.pagination.totalPages);
            }
          } else {
            console.error('No pagination data in response');
            // Set default pagination if missing
            const defaultPagination = {
              total: data.products ? data.products.length : 0,
              page: 1,
              limit: 12,
              totalPages: 1
            };
            setPagination(defaultPagination);
            if (onTotalPagesChange) {
              onTotalPagesChange(1);
            }
          }
          
          // First set the products without images to get the UI ready
          setProducts(data.products);
          
          // Then process images in a separate tick
          setTimeout(() => {
            if (isMounted) {
              const initialSelectedImages: { [key: string]: string } = {};
              
              // Process 2 products at a time with a small delay between batches
              const processProductBatch = (startIndex: number) => {
                if (!isMounted) return;
                
                const endIndex = Math.min(startIndex + 2, data.products.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                  const product = data.products[i];
                  if (product && product.colorVariants && product.colorVariants.length > 0) {
                    const firstVariant = product.colorVariants[0];
                    if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
                      const mainImage = firstVariant.images.find((img: ProductImage) => img.isMain)?.url || firstVariant.images[0]?.url;
                      if (mainImage) {
                        initialSelectedImages[product.id] = mainImage;
                      }
                    }
                  }
                }
                
                // Update images for processed products
                setSelectedImage(prev => ({ ...prev, ...initialSelectedImages }));
                
                // Process next batch if there are more products
                if (endIndex < data.products.length && isMounted) {
                  setTimeout(() => processProductBatch(endIndex), 50);
                } else if (isMounted) {
                  setLoading(false);
                }
              };
              
              // Start processing from the first product
              if (data.products && data.products.length > 0) {
                processProductBatch(0);
              } else {
                setLoading(false);
              }
            }
          }, 100);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching products:', error);
          setError(error instanceof Error ? error.message : 'Failed to fetch products');
          setLoading(false);
        }
      }
    }

    fetchProducts();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [filters.category, filters.collaborator, filters.group, filters.product, filters.sort, filters.page, pagination.page, pagination.limit, onTotalPagesChange]);

  // Removed handleAddToCart function as we're directing users to the product page instead

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
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
      ) : !filteredProducts || filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
          {filters.searchQuery && (
            <p className="text-sm text-gray-400">Essayez de modifier votre recherche ou vos filtres</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
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
                    loading="lazy"
                    quality={50}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  />
                )}

                {/* Promo Badge */}
                {product.salePrice && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                    Promo
                  </div>
                )}

                {/* See More Details Overlay */}
                <div className={cn(
                  "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300",
                  hoveredProduct === product.id.toString() && "opacity-100"
                )}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product.id}`);
                    }}
                    className="bg-[#D4AF37] text-white hover:bg-[#C09C2C]"
                  >
                    <Eye className="w-4 h-4 mr-2 " />
                    Voir Détails
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

              {/* Color Options - Optimized to show only a few variants */}
              <div className="mt-1 flex items-center">
                <div className="flex -space-x-2 mr-2">
                  {product.colorVariants.slice(0, 3).map((variant, idx) => {
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
                          "relative w-6 h-6 rounded-full overflow-hidden border-2",
                          selectedColors[product.id] === variant.color
                            ? "border-[#D4AF37] z-10"
                            : "border-white"
                        )}
                        style={{ zIndex: 3 - idx }}
                        aria-label={variant.color}
                      >
                        {variantMainImage && (
                          <Image
                            src={variantMainImage}
                            alt={`${product.name} in ${variant.color}`}
                            fill
                            className="object-cover"
                            sizes="24px"
                            loading="lazy"
                            quality={30}
                          />
                        )}
                      </button>
                    );
                  })}
                  {product.colorVariants.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center" style={{ zIndex: 0 }}>
                      <span className="text-[10px] text-gray-600 font-medium">+{product.colorVariants.length - 3}</span>
                    </div>
                  )}
                </div>
                {selectedColors[product.id] && (
                  <span className="text-xs text-gray-600 capitalize">
                    {selectedColors[product.id]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Dialog removed as it's no longer needed */}
    </>
  );
};

export default ProductGrid;