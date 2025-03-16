"use client";

import { useCart } from "@/lib/context/cart-context";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash } from "lucide-react";
import { usePathname } from 'next/navigation';

export function CartDropdown() {
  const { items, removeItem, updateQuantity } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [prevItemsLength, setPrevItemsLength] = useState(items.length);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show dropdown on cart page
    if (pathname === '/cart') {
      setIsVisible(false);
      return;
    }

    // Only show dropdown when items are added (not on quantity updates)
    if (items.length > prevItemsLength) {
      setIsVisible(true);

      // Clear existing timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Set new timeout to hide dropdown after 5 seconds
      const newTimeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      setTimeoutId(newTimeoutId);
    }

    // Update previous items length
    setPrevItemsLength(items.length);
  }, [items, pathname]);

  if (!isVisible) return null;

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed top-20 right-4 z-50 w-96 bg-white rounded-lg shadow-xl border border-[#7c3f61]/20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#7c3f61] flex items-center gap-2">
            <ShoppingBag size={20} />
            Panier ({items.length})
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-[#7c3f61]"
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
                    className="p-1 hover:text-[#7c3f61]"
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
                    className="p-1 hover:text-[#7c3f61]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-[#7c3f61]">
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
            <span className="font-bold text-[#7c3f61]">TND{formatPrice(total)}</span>
          </div>

          <div className="flex gap-2">
            <Link href="/cart" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-[#7c3f61] text-[#7c3f61] hover:bg-[#7c3f61] hover:text-white"
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