"use client";

import { useCart } from "@/lib/context/cart-context";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash } from "lucide-react";

export function CartDropdown() {
  const { items, removeItem, updateQuantity } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Afficher le dropdown lorsque les articles changent
    if (items.length > 0) {
      setIsVisible(true);

      // Effacer le timeout existant
      if (timeoutId) clearTimeout(timeoutId);

      // Définir un nouveau timeout pour masquer le dropdown après 5 secondes
      const newTimeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      setTimeoutId(newTimeoutId);
    }
  }, [items]);

  if (!isVisible) return null;

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed top-20 right-4 z-50 w-96 bg-white rounded-lg shadow-xl border border-[#D4AF37]/20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
            <ShoppingBag size={20} />
            Panier ({items.length})
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-[#D4AF37]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className="flex items-center gap-4 py-3 border-b border-gray-100"
            >
              <div className="relative w-16 h-16">
                <Image
                  src={item.images?.[0]?.url || "/placeholder.png"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  Taille: {item.selectedSize} | Couleur: {item.selectedColor}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        Math.max(1, item.quantity - 1),
                        item.selectedSize,
                        item.selectedColor
                      )
                    }
                    className="p-1 hover:text-[#D4AF37]"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity + 1,
                        item.selectedSize,
                        item.selectedColor
                      )
                    }
                    className="p-1 hover:text-[#D4AF37]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-[#D4AF37]">
                  TND{formatPrice(item.price * item.quantity)}
                </p>
                <button
                  onClick={() =>
                    removeItem(item.id, item.selectedSize, item.selectedColor)
                  }
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  <Trash size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-[#D4AF37]">TND{formatPrice(total)}</span>
          </div>

          <div className="flex gap-2">
            <Link href="/cart" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
              >
                Voir le Panier
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}