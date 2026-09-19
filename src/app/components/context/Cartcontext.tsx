"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface CartContextType {
  itemCount: number;
  addItem: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  itemCount: 0,
  addItem: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const addItem = () => setItemCount((c) => c + 1);
  const clearCart = () => setItemCount(0);

  return (
    <CartContext.Provider value={{ itemCount, addItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
