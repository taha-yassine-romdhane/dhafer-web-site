"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { ShoppingBag, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"


const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }),
  governorate: z.string({
    required_error: "Veuillez sélectionner un gouvernorat.",
  }),
  phone: z.string().regex(/^[0-9]{8}$/, {
    message: "Le numéro de téléphone doit contenir exactement 8 chiffres.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),  // Allow empty string
  quantity: z.number().min(1),
})

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
  "Kébili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
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
]

interface DirectPurchaseFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>
  className?: string
  isSubmitting?: boolean
  isProductAvailable?: boolean
  productInfo: {
    name: string
    price: number
    mainImageUrl: string | null
    email?: string
  }
}

export function DirectPurchaseForm({ onSubmit, className = "", isSubmitting = false, isProductAvailable = true, productInfo }: DirectPurchaseFormProps) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      governorate: "",
      phone: "",
      email: "",
      quantity: 1,
    },
  })

  useEffect(() => {
    if (isLoggedIn && user) {
      form.setValue("fullName", user.username)
    }
  }, [isLoggedIn, user])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null)

  const incrementQuantity = () => {
    const currentValue = form.getValues("quantity")
    form.setValue("quantity", currentValue + 1)
  }

  const decrementQuantity = () => {
    const currentValue = form.getValues("quantity")
    if (currentValue > 1) {
      form.setValue("quantity", currentValue - 1)
    }
  }

  const handleConfirm = async () => {
    if (formData && !isConfirming) {
      try {
        setIsConfirming(true);
        // Make sure we're passing the quantity as a number
        const dataWithQuantity = {
          ...formData,
          quantity: Number(formData.quantity) || 1
        };
        console.log('Submitting form data:', dataWithQuantity);
        await onSubmit(dataWithQuantity);
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error submitting order:', error);
      } finally {
        setIsConfirming(false);
      }
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => {
          setFormData(data)
          setIsDialogOpen(true)
        })} className={`space-y-4 ${className}`}>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="votre nom complet"
                    {...field}
                    className="rounded-full focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20"
                    disabled={!!user}
                  />
                </FormControl>
                <FormMessage className="text-[#D4AF37]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Votre adresse complète"
                    {...field}
                    className="rounded-full focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20"
                  />
                </FormControl>
                <FormMessage className="text-[#D4AF37]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="governorate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <select
                    className="w-full p-2 rounded-full focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20 outline-none"
                    {...field}
                  >
                    <option value="">Sélectionnez un gouvernorat</option>
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-[#D4AF37]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Votre numéro de télephone"
                    {...field}
                    className="rounded-full focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20"
                  />
                </FormControl>
                <FormMessage className="text-[#D4AF37]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email (facultatif)"
                    {...field}
                    className="rounded-full focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20"
                  />
                </FormControl>
                <FormMessage className="text-[#D4AF37]" />
              </FormItem>
            )}
          />


          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      className="rounded-full w-8 h-8 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] !border-[#D4AF37]/20"
                    >
                      -
                    </Button>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="text-center w-16 focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      className="rounded-full w-8 h-8 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] !border-[#D4AF37]/20"
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage className="text-[#D4AF37]" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className={`flex-1 ${isProductAvailable ? 'bg-[#d1a72e] text-white hover:bg-[#D4AF37]/80' : 'bg-gray-300 text-gray-600 cursor-not-allowed'} rounded !border-[#D4AF37]`}
              disabled={isSubmitting || !isProductAvailable}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
              {isProductAvailable ? 'Acheter Maintenant' : 'Produit Indisponible'}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="sm:max-w-[600px] rounded-lg">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gray-800 border-b pb-3">
        Aperçu de la commande
      </DialogTitle>
    </DialogHeader>
    
    <div className="grid gap-4 py-4">
      {/* Product Image with better styling */}
      {productInfo.mainImageUrl && (
        <div className="flex justify-center mb-4">
          <img 
            src={productInfo.mainImageUrl} 
            alt="Product Main Image" 
            className="w-32 h-32 object-contain rounded-lg border shadow-sm" 
          />
        </div>
      )}
      
      {/* Customer Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-gray-700">Informations client</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600"><strong>Nom et prénom:</strong></p>
            <p className="text-gray-800">{formData?.fullName}</p>
          </div>
          {formData?.email && (
            <div>
              <p className="text-sm text-gray-600"><strong>Email:</strong></p>
              <p className="text-gray-800">{formData?.email}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600"><strong>Adresse:</strong></p>
            <p className="text-gray-800">{formData?.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600"><strong>Gouvernorat:</strong></p>
            <p className="text-gray-800">{formData?.governorate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600"><strong>Téléphone:</strong></p>
            <p className="text-gray-800">{formData?.phone}</p>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-gray-700">Détails de la commande</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Produit:</span>
            <span className="font-medium">{productInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantité:</span>
            <span className="font-medium">{formData?.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Prix unitaire:</span>
            <span className="font-medium">{productInfo.price} TND</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Frais de livraison:</span>
            <span className="font-medium">6 TND</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between">
            <span className="text-gray-600 font-semibold">Total:</span>
            <span className="text-lg font-bold text-[#D4AF37]">
              {productInfo.price * (formData?.quantity || 1) + 6} TND
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter className="mt-4 gap-2 sm:gap-0">
      <Button 
        variant="outline" 
        onClick={() => setIsDialogOpen(false)}
        className="border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        Modifier
      </Button>
      <Button 
        className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white shadow hover:shadow-md transition-all"
        onClick={handleConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement...
          </>
        ) : (
          'Confirmer la commande'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </>
  )
}