"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, ProductImage, ColorVariant } from "@prisma/client";
import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/lib/context/cart-context";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductAvailability } from "@/components/product-availability";
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

const formSchema = z.object({
  fullName: z.string().min(1, "Veuillez entrer votre nom complet"),
  address: z.string().min(1, "Veuillez entrer votre adresse"),
  governorate: z.string().min(1, "Veuillez sélectionner un gouvernorat"),
  phone: z.string().min(1, "Veuillez entrer votre numéro de téléphone"),
});

const governorates = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kebili",
  "Le Kef",
  "Mahdia",
  "Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
];

export function ProductDetails({ product }: { product: ProductWithColorVariants }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();

  // Component State
  const [selectedColorVariant, setSelectedColorVariant] = useState<ColorVariant & { images: ProductImage[] } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isProductAvailable, setIsProductAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.username || "",
      address: "",
      governorate: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ fullName: user.username });
    }
  }, [user, form]);

  // Initialize selected color and image
  useEffect(() => {
    if (product.colorVariants && product.colorVariants.length > 0) {
      const firstVariant = product.colorVariants[0];
      setSelectedColorVariant(firstVariant);
      const mainImage = firstVariant.images.find((img) => img.isMain)?.url || firstVariant.images[0]?.url;
      setSelectedImageUrl(mainImage);
    }
  }, [product]);

  // Handlers
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColorVariant) {
      toast.error("Veuillez sélectionner une couleur et une taille.");
      return;
    }
    if (!isProductAvailable) {
      toast.error("Ce produit n'est pas disponible dans la taille ou la couleur sélectionnée.");
      return;
    }

    // The original addItem function in the cart context adds one item at a time.
    // We loop here to add the quantity selected by the user.
    for (let i = 0; i < quantity; i++) {
      addItem({ ...product, images: selectedColorVariant.images }, selectedSize, selectedColorVariant.color);
    }

    toast.success(`${quantity} x ${product.name} ajouté au panier!`);
  };

  const handleDirectPurchase = async (formData: z.infer<typeof formSchema>) => {
    if (!selectedSize || !selectedColorVariant) {
      toast.error("Veuillez sélectionner une couleur et une taille.");
      return;
    }
    if (!isProductAvailable) {
      toast.error("Ce produit n'est pas disponible pour un achat immédiat.");
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: formData.fullName,
        phoneNumber: formData.phone,
        address: `${formData.address}, ${formData.governorate}`,
        items: [{
          productId: product.id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColorVariant.color,
          price: product.salePrice ?? product.price,
        }],
        totalAmount: (product.salePrice ?? product.price) * quantity,
      };
      await apiPost('/orders', orderData);
      toast.success("Commande passée avec succès! Nous vous contacterons bientôt.");
      router.push('/');
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Échec de la création de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => price.toFixed(2);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
            {selectedColorVariant?.images.map((image) => (
              <button
                key={image.id}
                className={cn(
                  "flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition",
                  selectedImageUrl === image.url ? "border-[#7c3f61]" : "border-transparent hover:border-gray-300"
                )}
                onClick={() => setSelectedImageUrl(image.url)}
              >
                <Image src={image.url} alt="Thumbnail" width={80} height={96} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
            {selectedImageUrl ? (
              <Image src={selectedImageUrl} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Image non disponible</div>
            )}
          </div>
        </div>

        {/* Product Info & Form */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          {product.salePrice ? (
            <p className="text-2xl mt-2">
              <span className="font-bold text-[#7c3f61]">{formatPrice(product.salePrice)} TND</span>
              <span className="line-through text-gray-400 ml-3">{formatPrice(product.price)} TND</span>
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-2">{formatPrice(product.price)} TND</p>
          )}
          <div className="mt-4 text-gray-600 prose prose-sm" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-800">Couleur : <span className="font-semibold">{selectedColorVariant?.color}</span></h3>
            <div className="flex items-center space-x-2 mt-2">
              {product.colorVariants.map((variant) => (
                <button key={variant.id} onClick={() => { setSelectedColorVariant(variant); setSelectedImageUrl(variant.images.find(img => img.isMain)?.url || variant.images[0]?.url); }} className={cn("h-10 w-10 rounded-full border-2 overflow-hidden transition-transform duration-200", selectedColorVariant?.id === variant.id ? "border-[#7c3f61] scale-110" : "border-transparent hover:border-gray-300")} title={variant.color}>
                  <Image src={variant.images.find(img => img.isMain)?.url || variant.images[0]?.url || ''} alt={variant.color} width={40} height={40} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-800">Taille</h3>
              {selectedSize && <span className="text-sm text-gray-500">Sélectionné: {selectedSize}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.sizes?.map((size) => (
                <Button key={size} variant={selectedSize === size ? 'default' : 'outline'} onClick={() => setSelectedSize(size)} className={cn("rounded-md", selectedSize === size && "bg-[#7c3f61] text-white")}>{size}</Button>
              ))}
            </div>
          </div>

          {selectedColorVariant && selectedSize && (
            <div className="mt-4">
              <ProductAvailability productId={product.id} selectedColorId={selectedColorVariant.id} selectedSize={selectedSize} onAvailabilityChange={setIsProductAvailable} />
            </div>
          )}

          {isProductAvailable && selectedSize && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleDirectPurchase)} className="mt-6 space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormControl><Input placeholder="Votre nom complet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormControl><Input placeholder="Votre adresse complète" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="governorate" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez un gouvernorat" /></SelectTrigger></FormControl><SelectContent>{governorates.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormControl><Input placeholder="Votre numéro de téléphone" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-[#7c3f61] hover:bg-[#7c3f61]/90 text-white">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}Acheter Maintenant
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-4">
            <Button size="lg" variant="outline" onClick={handleAddToCart} disabled={!isProductAvailable || !selectedSize} className="w-full border-[#7c3f61] text-[#7c3f61] hover:bg-[#7c3f61]/5">
              Ajouter au Panier
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2 text-[#7c3f61]">Détails</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Catégorie: {product.categories?.map(cat => cat.category?.name).join(', ') || 'N/A'}</li>
              {product.collaborateur && <li>Modèle: {product.collaborateur}</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
