"use client";

import { useEffect, useState } from "react";
import { Product, ProductImage, ColorVariant, Stock } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { DirectPurchaseForm } from "@/components/direct-purchase-form";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/success-dialog";
import ProductGrid from "@/components/product-grid";

interface ProductWithColorVariants extends Omit<Product, "images"> {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
  })[];
  images: ProductImage[];
}

export default function ProductPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<ProductWithColorVariants | null>(null);
  const [selectedColorVariant, setSelectedColorVariant] = useState<ColorVariant & { images: ProductImage[] } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<{ fullName: string; address: string; governorate: string; phone: string }>({
    fullName: "",
    address: "",
    governorate: "",
    phone: "",
  });
  const [suggestedProducts, setSuggestedProducts] = useState<ProductWithColorVariants[]>([]);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${params.productId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
        if (data.colorVariants && data.colorVariants.length > 0) {
          const firstVariant = data.colorVariants[0];
          setSelectedColorVariant(firstVariant);
          const mainImage = firstVariant.images.find((img: ProductImage) => img.isMain)?.url || firstVariant.images[0]?.url;
          setSelectedImageUrl(mainImage);
        }

        // Fetch suggested products
        const suggestedResponse = await fetch(`/api/products/suggestions?category=${data.category}&exclude=${data.id}`);
        if (!suggestedResponse.ok) {
          const errorData = await suggestedResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${suggestedResponse.status}`);
        }
        const suggestedData = await suggestedResponse.json();
        setSuggestedProducts(suggestedData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.productId]);

  // Fetch stock data when color or product changes
  useEffect(() => {
    const fetchStockData = async () => {
      if (!product || !selectedColorVariant) return;
      
      setLoadingStock(true);
      try {
        const response = await fetch(`/api/products/${params.productId}/stock`);
        if (!response.ok) {
          throw new Error('Failed to fetch stock information');
        }
        
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        console.error('Error fetching stock:', error);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStockData();
  }, [params.productId, selectedColorVariant]);

  const isColorInStock = (colorId: number) => {
    return stockData.some(stock => stock.colorId === colorId && stock.inStock);
  };

  const isSizeInStock = (size: string) => {
    return stockData.some(stock => 
      stock.size === size && 
      stock.colorId === selectedColorVariant?.id && 
      stock.inStock
    );
  };

  const isCurrentSelectionInStock = () => {
    return stockData.some(stock => 
      stock.size === selectedSize && 
      stock.colorId === selectedColorVariant?.id && 
      stock.inStock
    );
  };

  const handleAddToCart = () => {
    if (!product || !selectedColorVariant || !selectedSize) {
      toast.error("Please select both size and color");
      return;
    }

    if (!isCurrentSelectionInStock()) {
      toast.error("This product is currently out of stock");
      return;
    }

    const productWithImages = {
      ...product,
      images: selectedColorVariant.images,
    };

    addItem(productWithImages, selectedSize, selectedColorVariant.color);

    toast.success("Added to cart successfully");
  };

  const handleDirectPurchase = async (formData: any) => {
    if (!product || !selectedColorVariant || !selectedSize) {
      toast.error("Veuillez sélectionner une taille et une couleur");
      return;
    }

    if (!isCurrentSelectionInStock()) {
      toast.error("Ce produit est actuellement en rupture de stock");
      return;
    }

    setSubmitting(true);

    const orderData = {
      ...formData,
      productId: product.id,
      colorId: selectedColorVariant.id,
      color: selectedColorVariant.color,
      size: selectedSize,
      price: product.salePrice || product.price,
    };

    try {
      const response = await fetch("/api/orders/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      setUserDetails({
        fullName: formData.fullName,
        address: formData.address,
        governorate: formData.governorate,
        phone: formData.phone,
      });

      setIsSuccessDialogOpen(true);
      toast.success("Commande placée avec succès! Nous vous contacterons bientôt.");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    const orderData = {
      productId: product!.id,
      colorId: selectedColorVariant!.id,
      color: selectedColorVariant!.color,
      size: selectedSize,
      price: product!.salePrice || product!.price,
      ...userDetails,
    };

    try {
      const response = await fetch("/api/orders/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      toast.success("Commande confirmée avec succès!");
    } catch (error) {
      console.error("Error confirming order:", error);
      toast.error("Erreur lors de la confirmation de la commande. Veuillez réessayer.");
    } finally {
      setIsSuccessDialogOpen(false);
    }
  };

  // Handle zoom on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const img = container.querySelector("img");
    if (!img) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = "scale(1.5)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector("img");
    if (!img) return;

    img.style.transformOrigin = "center";
    img.style.transform = "scale(1)";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#7c3f61]" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!product || !selectedColorVariant || !selectedImageUrl) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="flex gap-4">
          {/* Thumbnail Images */}
          <div className="flex flex-col gap-2">
            {selectedColorVariant.images.map((image) => (
              <button
                key={image.id}
                onMouseEnter={() => setSelectedImageUrl(image.url)}
                className={cn(
                  "relative w-20 h-20 overflow-hidden rounded-lg bg-gray-100 hover:ring-2 hover:ring-[#7c3f61] transition-all",
                  selectedImageUrl === image.url && "ring-2 ring-[#7c3f61]"
                )}
              >
                <Image
                  src={image.url}
                  alt={`${product.name} - ${image.position}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Main Image with Zoom */}
          <div
            className="flex-1 relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 zoom-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              src={selectedImageUrl}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-300"
              priority
              quality={90}
              sizes="(max-width: 720px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold text-[#7c3f61]">
              {product.salePrice ? (
                <>
                  <span>{formatPrice(product.salePrice)} TND</span>
                  <span className="text-lg text-gray-500 line-through ml-2">
                    {formatPrice(product.price)} TND
                  </span>
                </>
              ) : (
                <span>{formatPrice(product.price)} TND</span>
              )}
            </span>
          </div>

          {/* Description */}
          <div className="text-gray-600 whitespace-pre-line">
            {product.description}
          </div>

          {/* Color Variants */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <div className="flex flex-wrap gap-2">
              {product.colorVariants.map((variant) => {
                const variantMainImage = variant.images.find((img: ProductImage) => img.isMain)?.url || variant.images[0]?.url;
                const colorAvailable = isColorInStock(variant.id);
                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      if (colorAvailable) {
                        setSelectedColorVariant(variant);
                        setSelectedImageUrl(variantMainImage);
                        setSelectedSize(""); // Reset size when color changes
                      } else {
                        toast.error(`La couleur ${variant.color} est en rupture de stock`);
                      }
                    }}
                    disabled={!colorAvailable}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 relative overflow-hidden group",
                      selectedColorVariant.id === variant.id
                        ? "border-[#7c3f61] ring-2 ring-[#7c3f61] ring-offset-1"
                        : colorAvailable 
                          ? "border-transparent hover:border-[#7c3f61]/50" 
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                    )}
                    aria-label={variant.color}
                  >
                    <div className="absolute inset-[-50%] w-[200%] h-[200%]">
                      <Image
                        src={variantMainImage}
                        alt={`${product.name} in ${variant.color}`}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-200 scale-110",
                          colorAvailable ? "group-hover:scale-125" : "grayscale"
                        )}
                        sizes="40px"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const sizeAvailable = isSizeInStock(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (sizeAvailable) {
                          setSelectedSize(size);
                        } else {
                          toast.error(`La taille ${size} est en rupture de stock pour cette couleur`);
                        }
                      }}
                      disabled={!sizeAvailable}
                      className={cn(
                        "px-4 py-2 text-sm rounded-md border-2 transition-colors",
                        selectedSize === size
                          ? "border-[#7c3f61] bg-[#7c3f61] text-white"
                          : sizeAvailable
                            ? "border-gray-200 hover:border-[#7c3f61]/50"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-4">
            {loadingStock ? (
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : selectedSize && selectedColorVariant ? (
              <div className={cn(
                "inline-block px-3 py-1 rounded-full text-sm font-medium",
                isCurrentSelectionInStock() 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              )}>
                {isCurrentSelectionInStock() ? "En stock" : "Rupture de stock"}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Veuillez sélectionner une taille et une couleur</div>
            )}
          </div>

          {/* Direct Purchase Form */}
          <div className="border-t border-[#7c3f61]/20 pt-6">
            <DirectPurchaseForm
              onSubmit={handleDirectPurchase}
              className="space-y-4"
              isSubmitting={submitting}
              productInfo={{
                name: product.name,
                price: product.salePrice || product.price,
                mainImageUrl: selectedImageUrl,
                selectedColor: selectedColorVariant.color,
              }}
            />
          </div>

          <div className="flex flex-col space-y-4">
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!isCurrentSelectionInStock() || !selectedSize || !selectedColorVariant}
              className={cn(
                "w-full py-6 text-lg text-white",
                isCurrentSelectionInStock() && selectedSize && selectedColorVariant
                  ? "bg-[#7c3f61] hover:bg-[#7c3f61]/90"
                  : "bg-gray-400 cursor-not-allowed"
              )}
              size="lg"
            >
              Ajouter au Panier
            </Button>

            {/* Additional Information */}
            <div className="border-t border-[#7c3f61]/20 pt-6 mt-6">
              <h3 className="text-sm font-medium mb-4 text-[#7c3f61]">Détails</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Catégorie: {product.category}</li>
                {product.collaborateur && (
                  <li>Modèle: {product.collaborateur}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits suggérés</h2>
        <ProductGrid filters={{ category: product.category, collaborator: "all", sort: "featured", product: "" }} />
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        onConfirm={handleConfirmOrder}
        title="Commande Réussie!"
        description={`Merci pour votre commande! Nous vous contacterons bientôt au ${userDetails.phone} pour confirmer.`}
      />
    </div>
  );
}