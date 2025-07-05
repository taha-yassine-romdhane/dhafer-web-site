"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product, ProductImage, ColorVariant } from "@prisma/client";

type CartItem = Product & {
  images: ProductImage[];
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  colorVariants?: (ColorVariant & {
    images: ProductImage[];
  })[];
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product & { images: ProductImage[] }, size: string, color: string) => void;
  removeItem: (productId: number, size: string, color: string) => void;
  updateQuantity: (productId: number, quantity: number, size: string, color: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart data on client-side only
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        } else {
          setItems([]);
          localStorage.removeItem("cart");
        }
      } catch (error) {
        setItems([]);
        localStorage.removeItem("cart");
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (product: Product & { images: ProductImage[] }, size: string, color: string) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newItem: CartItem = {
        ...product,
        images: product.images,
        quantity: 1,
        selectedSize: size,
        selectedColor: color
      };

      return [...currentItems, newItem];
    });
  };

  const removeItem = (productId: number, size: string, color: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, size: string, color: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const totalPrice = Array.isArray(items) ? items.reduce((total, item) => {
    // Use salePrice if available, otherwise use regular price
    const effectivePrice = item.salePrice !== null && item.salePrice !== undefined ? item.salePrice : item.price;
    return total + effectivePrice * item.quantity;
  }, 0) : 0;
  const totalItems = Array.isArray(items) ? items.reduce((total, item) => total + item.quantity, 0) : 0;

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