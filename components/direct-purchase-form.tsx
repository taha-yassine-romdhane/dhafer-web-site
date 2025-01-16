"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
  onSubmit: (data: z.infer<typeof formSchema>) => void
  className?: string
}

export function DirectPurchaseForm({ onSubmit, className = "" }: DirectPurchaseFormProps) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="Nom et prénom" 
                  {...field} 
                  className="rounded-full border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20" 
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
                  placeholder="Adresse *" 
                  {...field} 
                  className="rounded-full border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20" 
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
                  className="w-full p-2 rounded-full border border-[#D4AF37]/20 bg-background focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20 outline-none"
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
                  placeholder="Téléphone" 
                  {...field} 
                  className="rounded-full border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20" 
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
                    className="rounded-full w-8 h-8 border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] !border-[#D4AF37]/20"
                  >
                    -
                  </Button>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="text-center w-16 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37] hover:border-[#D4AF37] !border-[#D4AF37]/20"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    className="rounded-full w-8 h-8 border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] !border-[#D4AF37]/20"
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
            className="flex-1 bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90 rounded-full !border-[#D4AF37]"
          >
            Acheter Maintenant
          </Button>
        </div>
      </form>
    </Form>
  )
}