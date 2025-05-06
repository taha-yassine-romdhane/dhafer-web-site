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

const ProductGrid = ({ filters, productsPerPage = 5, onPageChange, onTotalPagesChange }: ProductGridProps) => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithColorVariants[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: string }>({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: filters.page || 1,
    limit: productsPerPage,
    totalPages: 1
  });

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // Update pagination when productsPerPage changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      limit: productsPerPage
    }));
  }, [productsPerPage]);

  // Fetch products when filters or page or productsPerPage change
  useEffect(() => {
    // Track if the component is mounted to avoid memory leaks
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
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
        
        // Handle search query
        if (filters.searchQuery) {
          params.append('search', filters.searchQuery);
        }
        
        // Add pagination parameters - always include these
        params.append('page', String(filters.page || 1));
        params.append('limit', String(productsPerPage));

        console.log('Fetching products with params:', params.toString());
        
        const response = await fetch('/api/products?' + params.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Only proceed if the component is still mounted
        if (!isMounted) return;
        
        // Process pagination data
        if (data.pagination) {
          // Ensure totalPages is at least 1
          const totalPages = Math.max(1, data.pagination.totalPages);
          
          // Notify parent component of total pages
          if (onTotalPagesChange) {
            onTotalPagesChange(totalPages);
          }
        } else if (data.products) {
          // Calculate pagination if not provided
          const total = data.total || data.products.length;
          const totalPages = Math.max(1, Math.ceil(total / productsPerPage));
          
          // Notify parent component of total pages
          if (onTotalPagesChange) {
            onTotalPagesChange(totalPages);
          }
        }
        
        // Set products and process images
        setProducts(data.products);
        
        // Process product images
        if (data.products && data.products.length > 0) {
          const newSelectedColors: { [key: string]: string } = {};
          const newSelectedImages: { [key: string]: string } = {};
          
          data.products.forEach((product: ProductWithColorVariants) => {
            if (product.colorVariants && product.colorVariants.length > 0) {
              // Set default selected color
              newSelectedColors[product.id] = product.colorVariants[0].color;
              
              // Set default selected image
              const mainImage = product.colorVariants[0].images.find(img => img.isMain)?.url || 
                               product.colorVariants[0].images[0]?.url;
              
              if (mainImage) {
                newSelectedImages[product.id] = mainImage;
              }
            }
          });
          
          setSelectedColors(prev => ({ ...prev, ...newSelectedColors }));
          setSelectedImage(prev => ({ ...prev, ...newSelectedImages }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch products');
          setLoading(false);
        }
      }
    };
    
    fetchProducts();
    
    // Cleanup function to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, [filters.category, filters.collaborator, filters.group, filters.page, filters.product, filters.searchQuery, filters.sort, productsPerPage, onTotalPagesChange]);

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
          {[...Array(productsPerPage)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] mb-2 rounded-md bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-2 flex space-x-1">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
          >
            Réessayer
          </Button>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
          {filters.searchQuery && (
            <p className="text-sm text-gray-400">Essayez de modifier votre recherche ou vos filtres</p>
          )}
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
                    <p className="text-xs text-[#D4AF37]">{formatPrice(product.price)} TND</p>
                  )}
                  {product.salePrice && (
                    <p className="text-xs text-[#D4AF37] font-semibold"><span className="text-red-600 mr-1">Promo :</span> {formatPrice(product.salePrice)} TND</p>
                  )}
                </div>

                {/* Color Variant Thumbnails */}
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
            </div>
          ))}
        </div>
      )}
      
      {/* Removed pagination controls from here - they'll be handled by the collections page */}
    </>
  );
};

export default ProductGrid;
