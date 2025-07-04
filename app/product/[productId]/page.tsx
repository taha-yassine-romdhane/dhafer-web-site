"use client";

import { useEffect, useState } from "react";
import { Product, ProductImage, ColorVariant } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { DirectPurchaseForm } from "@/components/direct-purchase-form";
import { ProductAvailability } from "@/components/product-availability";
import { toast } from "sonner";
import { SuccessDialog } from "@/components/success-dialog";
import { apiPost } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import SuggestedProductCard from "@/app/components/SuggestedProductCard";
import SuggestedMobileProductCard from "@/app/components/SuggestedMobileProductCard";
import { StockNotificationForm } from "@/components/stock-notification-form";

interface ProductWithColorVariants extends Omit<Product, "images"> {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
  })[];
  images: ProductImage[];
  categories?: {
    categoryId: number;
    category?: {
      id: number;
      name: string;
    };
  }[];
  sizes?: string[];
}

export default function ProductPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithColorVariants | null>(null);
  const [selectedColorVariant, setSelectedColorVariant] = useState<ColorVariant & { images: ProductImage[] } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isProductAvailable, setIsProductAvailable] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [userDetails, setUserDetails] = useState<{ fullName: string; address: string; governorate: string; phone: string; email: string; quantity?: number }>({
    fullName: "",
    address: "",
    governorate: "",
    phone: "",
    email: ""
  });
  const [suggestedProducts, setSuggestedProducts] = useState<ProductWithColorVariants[]>([]);
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();

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
        // Use the first category ID if available, otherwise use a default
        const categoryId = data.categories && data.categories.length > 0 
          ? data.categories[0].categoryId 
          : 1; // Default to category ID 1 if no categories
          
        const suggestedResponse = await fetch(`/api/products/suggestions?category=${categoryId}&exclude=${data.id}`);
        if (!suggestedResponse.ok) {
          console.error('Error fetching suggested products:', await suggestedResponse.text());
          // Don't throw an error here, just log it and continue
        } else {
          const suggestedData = await suggestedResponse.json();
          setSuggestedProducts(suggestedData);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.productId]);

  const handleAddToCart = () => {
    if (!product || !selectedColorVariant || !selectedSize) {
      toast.error("Veuillez sélectionner une taille et une couleur");
      return;
    }
    
    if (!isProductAvailable) {
      toast.error("Ce produit n'est pas disponible actuellement");
      return;
    }

    const productWithImages = {
      ...product,
      images: selectedColorVariant.images,
    };

    addItem(productWithImages, selectedSize, selectedColorVariant.color);

    toast.success("Ajouté au panier avec succès");
  };

  const handleDirectPurchase = async (formData: any) => {
    if (!product || !selectedColorVariant || !selectedSize) {
      toast.error("Veuillez sélectionner une taille et une couleur");
      return;
    }
    
    if (!isProductAvailable) {
      toast.error("Ce produit n'est pas disponible actuellement");
      return;
    }

    // Store the form data for later use in the confirmation dialog
    setUserDetails({
      fullName: formData.fullName,
      address: formData.address,
      governorate: formData.governorate,
      phone: formData.phone,
      email: formData.email,
      quantity: formData.quantity || 1 // Make sure we capture quantity
    });

    // Show the confirmation dialog without creating the order yet
    setIsSuccessDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    
    // Find the sizeId corresponding to the selectedSize string
    let sizeId;
    if (product?.sizes) {
      try {
        // Fetch the size ID from the database
        const sizeResponse = await fetch(`/api/sizes?value=${encodeURIComponent(selectedSize)}`);
        if (sizeResponse.ok) {
          const sizeData = await sizeResponse.json();
          if (sizeData && sizeData.id) {
            sizeId = sizeData.id;
          }
        }
      } catch (error) {
        console.error("Error fetching size ID:", error);
      }
    }
    
    if (!sizeId) {
      toast.error("Impossible de trouver l'ID de taille. Veuillez réessayer.");
      setSubmitting(false);
      return;
    }
    
    // Include quantity from the form data
    const orderData = {
      productId: product!.id,
      colorId: selectedColorVariant!.id,
      sizeId: sizeId, // Use sizeId instead of size string
      price: product!.salePrice || product!.price,
      quantity: userDetails.quantity || 1, // Use the quantity from form data
      fullName: userDetails.fullName,
      phone: userDetails.phone,
      address: userDetails.address,
      governorate: userDetails.governorate,
      email: userDetails.email,
    };

    console.log('Sending order data:', orderData);

    try {
      // Use apiPost which automatically includes the auth token in headers
      const result = await apiPost("/api/orders/direct", orderData);
      console.log('Order API response:', result);

      // Close the confirmation dialog
      setIsSuccessDialogOpen(false);
      
      // Show success toast
      toast.success(
        'Commande créée avec succès!', 
        {
          description: 'Nous vous contacterons bientôt pour confirmer les détails de votre commande.',
          duration: 8000, // Show for longer
          icon: '✅',
          style: {
            border: '2px solid #D4AF37',
            borderRadius: '8px',
            background: '#FFFBEB',
            padding: '16px',
            fontSize: '16px',
          },
        }
      );
      
      // Show another toast as a backup
      setTimeout(() => {
        toast.success('Votre commande a été créée avec succès!', { duration: 5000 });
      }, 500);
      
      // Show success modal
      setShowOrderSuccessModal(true);
      
      // Redirect to home page after a delay
      setTimeout(() => {
        router.push('/');
      }, 5000);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Erreur lors de la commande. Veuillez réessayer.");
      setIsSuccessDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
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
                  loading="lazy"
                  quality={60} // Lower quality for thumbnails
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={selectedImageUrl}
              alt={product.name}
              fill
              className="object-cover object-center"
              priority
              quality={75}
              sizes="(max-width: 720px) 100vw, 50vw"
              loading="eager"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
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
          <p className="text-gray-600">{product.description}</p>

          {/* Color Variants */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Color{selectedColorVariant ? ` : ${selectedColorVariant.color}` : ''}
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colorVariants.map((variant) => {
                const variantMainImage = variant.images.find((img: ProductImage) => img.isMain)?.url || variant.images[0]?.url;
                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedColorVariant(variant);
                      setSelectedImageUrl(variantMainImage);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 relative overflow-hidden group",
                      selectedColorVariant.id === variant.id
                        ? "border-[#7c3f61] ring-2 ring-[#7c3f61] ring-offset-1"
                        : "border-transparent hover:border-[#7c3f61]/50"
                    )}
                    aria-label={variant.color}
                  >
                    <div className="absolute inset-[-50%] w-[200%] h-[200%]">
                      <Image
                        src={variantMainImage}
                        alt={`${product.name} in ${variant.color}`}
                        fill
                        className="object-cover transition-transform duration-200 scale-110 group-hover:scale-125"
                        sizes="40px"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 ? (
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Taille</label>
                {selectedSize && (
                  <span className="text-sm text-gray-500">Sélectionné: <span className="font-semibold text-[#7c3f61]">{selectedSize}</span></span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-5 py-2.5 text-sm font-medium rounded-md border-2 transition-all",
                      selectedSize === size
                        ? "border-[#7c3f61] bg-[#7c3f61] text-white shadow-sm"
                        : "border-gray-300 hover:border-[#7c3f61] hover:bg-[#7c3f61]/5"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-amber-600 mt-1">Veuillez sélectionner une taille</p>
              )}
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Aucune taille disponible pour ce produit</p>
            </div>
          )}

          <div>
            <ProductAvailability
              productId={product.id}
              selectedSize={selectedSize}
              selectedColorId={selectedColorVariant?.id}
              className="mt-4"
              onAvailabilityChange={(available) => {
                setIsProductAvailable(available);
              }}
            />
            
            {/* Stock Notification Form for out-of-stock products */}
            {selectedSize && selectedColorVariant && !isProductAvailable && (
              <StockNotificationForm
                productId={product.id}
                productName={product.name}
                selectedSize={selectedSize}
                selectedColor={selectedColorVariant.color}
                isAvailable={isProductAvailable}
                className="mt-4"
              />
            )}
          </div>

          <div className="flex flex-col space-y-4">
            {/* Direct Purchase Form */}
            <DirectPurchaseForm
              onSubmit={handleDirectPurchase}
              className="space-y-4"
              isSubmitting={submitting}
              isProductAvailable={isProductAvailable}
              productInfo={{
                name: product.name,
                price: product.salePrice || product.price,
                mainImageUrl: selectedImageUrl,
              }}
            />

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className={`w-full py-6 text-lg ${isProductAvailable ? 'bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              size="lg"
              disabled={!isProductAvailable}
            >
              {isProductAvailable ? 'Ajouter au Panier' : 'Produit Indisponible'}
            </Button>

            {/* Additional Information */}
            <div className="border-t border-[#7c3f61]/20 pt-6 mt-6">
              <h3 className="text-sm font-medium mb-4 text-[#7c3f61]">Détails</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Catégorie: {
                  product.categories && product.categories.length > 0 
                    ? product.categories.map(cat => cat.category?.name || '').filter(Boolean).join(', ')
                    : 'Non catégorisé'
                }</li>
                {product.collaborateur && (
                  <li>Modèle: {product.collaborateur}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Products 
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits suggérés</h2>
        {suggestedProducts && suggestedProducts.length > 0 ? (
          <>
           
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suggestedProducts.slice(0, 4).map((suggestedProduct) => (
                <SuggestedProductCard key={suggestedProduct.id} product={suggestedProduct} />
              ))}
            </div>
            
            
            <div className="grid grid-cols-2 gap-4 md:hidden">
              {suggestedProducts.slice(0, 4).map((suggestedProduct) => (
                <SuggestedMobileProductCard key={suggestedProduct.id} product={suggestedProduct} />
              ))}
            </div>
            
            
            {suggestedProducts.length > 4 && (
              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    // This would typically load more products
                    // For now, we're just showing a message
                    toast.info('Voir plus de produits similaires');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-[#7c3f61] text-sm font-medium rounded-md text-[#7c3f61] bg-white hover:bg-[#7c3f61]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3f61]"
                >
                  Voir plus
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">Aucun produit similaire trouvé</p>
        )}
      </div> 
      */}

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        message="Veuillez confirmer votre commande"
        onConfirm={handleConfirmOrder}
        product={product}
        selectedColorVariant={selectedColorVariant}
        selectedSize={selectedSize}
        userDetails={userDetails}
      />

      {/* Order Success Modal */}
      {showOrderSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl border-2 border-[#7c3f61] text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#7c3f61] mb-4">Commande créée avec succès!</h2>
            <p className="text-gray-600 mb-6">
              Nous vous contacterons bientôt pour confirmer les détails de votre commande et organiser la livraison.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirection vers la page d'accueil dans quelques secondes...
            </p>
            <Button
              className="w-full bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white py-3"
              onClick={() => router.push('/')}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}