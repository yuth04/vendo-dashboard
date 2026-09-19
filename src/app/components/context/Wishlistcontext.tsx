"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface WishlistContextType {
  wishlistCount: number;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistCount: 0,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isWishlisted: () => false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Set<string>>(new Set());

  const addToWishlist = (id: string) => setItems((prev) => new Set(prev).add(id));
  const removeFromWishlist = (id: string) => {
    setItems((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };
  const isWishlisted = (id: string) => items.has(id);

  return (
    <WishlistContext.Provider value={{ wishlistCount: items.size, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
