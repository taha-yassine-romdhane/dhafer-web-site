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

// Add user type based on your schema
interface User {
  id: number
  username: string
  email: string
  isSubscribed: boolean
  fidelityPoints: number
}

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
  phone: z.string().regex(/^[0-9+\s-]{8,}$/, {
    message: "Veuillez entrer un numéro de téléphone valide.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional(),
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
  productInfo: {
    name: string
    price: number
    mainImageUrl: string | null
    selectedColor?: string
  }
}

export function DirectPurchaseForm({ onSubmit, className = "", isSubmitting = false, productInfo }: DirectPurchaseFormProps) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      governorate: "",
      phone: "",
      quantity: 1,
    },
  })

  useEffect(() => {
    if (isLoggedIn && user) {
      form.setValue("fullName", user.username)
      form.setValue("email", user.email)
    }
  }, [isLoggedIn, user])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
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
    if (formData) {
      await onSubmit(formData)
      setIsDialogOpen(false)
      setIsSuccessDialogOpen(true)
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
                    placeholder="Nom et prénom"
                    {...field}
                    className="rounded-full border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61] hover:border-[#7c3f61] !border-[#7c3f61]/20"
                    disabled={!!user}
                  />
                </FormControl>
                <FormMessage className="text-[#7c3f61]" />
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
                    placeholder="Adresse *"
                    {...field}
                    className="rounded-full border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61] hover:border-[#7c3f61] !border-[#7c3f61]/20"
                  />
                </FormControl>
                <FormMessage className="text-[#7c3f61]" />
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
                    className="w-full p-2 rounded-full border border-[#7c3f61]/20 bg-background focus:border-[#7c3f61] focus:ring-[#7c3f61] hover:border-[#7c3f61] !border-[#7c3f61]/20 outline-none"
                    {...field}
                  >
                    <option value="">Sélectionnez un gouvernorat</option>
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-[#7c3f61]" />
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
                    placeholder="Téléphone"
                    {...field}
                    className="rounded-full border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61] hover:border-[#7c3f61] !border-[#7c3f61]/20"
                  />
                </FormControl>
                <FormMessage className="text-[#7c3f61]" />
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
                      className="rounded-full w-8 h-8 border-[#7c3f61]/20 hover:bg-[#7c3f61]/10 hover:border-[#7c3f61] text-[#7c3f61] !border-[#7c3f61]/20"
                    >
                      -
                    </Button>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="text-center w-16 border-[#7c3f61]/20 focus:border-[#7c3f61] focus:ring-[#7c3f61] hover:border-[#7c3f61] !border-[#7c3f61]/20"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      className="rounded-full w-8 h-8 border-[#7c3f61]/20 hover:bg-[#7c3f61]/10 hover:border-[#7c3f61] text-[#7c3f61] !border-[#7c3f61]/20"
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage className="text-[#7c3f61]" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="flex-1 bg-[#7c3f61] text-white hover:bg-[#7c3f61]/80 rounded !border-[#7c3f61]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
              Acheter Maintenant
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation de la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {productInfo.mainImageUrl && <img src={productInfo.mainImageUrl} alt="Product Main Image" style={{ width: '150px', height: 'auto' }} />}
            <p><strong>Nom et prénom:</strong> {formData?.fullName}</p>
            <p><strong>Adresse:</strong> {formData?.address}</p>
            <p><strong>Gouvernorat:</strong> {formData?.governorate}</p>
            <p><strong>Téléphone:</strong> {formData?.phone}</p>
            <p><strong>Quantité:</strong> {formData?.quantity}</p>
            <p><strong>Produit:</strong> {productInfo.name}</p>
            {productInfo.selectedColor && <p><strong>Couleur:</strong> {productInfo.selectedColor}</p>}
            <p><strong>Prix:</strong> <span className="text-[#7c3f61]">{productInfo.price * (formData?.quantity || 1)}</span> TND + <span className="text-[#7c3f61]">7 TND</span> de frais de livraison</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#7c3f61] text-white hover:bg-[#7c3f61]/90" onClick={handleConfirm}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}