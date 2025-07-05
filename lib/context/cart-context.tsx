"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product, ProductImage } from "@prisma/client";

// The product object passed when adding to cart
type ProductInCart = Product & {
  colorVariantId: number;
  images: ProductImage[];
};

// The item structure stored in the cart state
type CartItem = ProductInCart & {
  quantity: number;
  selectedSize: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: ProductInCart, size: string, quantity: number) => void;
  removeItem: (productId: number, size: string, colorVariantId: number) => void;
  updateQuantity: (productId: number, quantity: number, size: string, colorVariantId: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      } catch (error) {
        setItems([]);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (product: ProductInCart, size: string, quantity: number) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.colorVariantId === product.colorVariantId
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.colorVariantId === product.colorVariantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newItem: CartItem = {
        ...product,
        quantity: quantity,
        selectedSize: size,
      };

      return [...currentItems, newItem];
    });
  };

  const removeItem = (productId: number, size: string, colorVariantId: number) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(item.id === productId && item.selectedSize === size && item.colorVariantId === colorVariantId)
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, size: string, colorVariantId: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId && item.selectedSize === size && item.colorVariantId === colorVariantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const totalPrice = items.reduce((total, item) => {
    const effectivePrice = item.salePrice ?? item.price;
    return total + effectivePrice * item.quantity;
  }, 0);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}