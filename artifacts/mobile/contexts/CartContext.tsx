import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { MenuItem } from "@/constants/menu";

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  appliedCoupon: string | null;
  discount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  finalTotal: number;
  deliveryFee: number;
}

const COUPONS: Record<string, number> = {
  HAPPY20: 0.2,
  COMBO299: 0,
  WINGS3: 0,
  FIRST50: 50,
  TEMPT10: 0.1,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("cart").then((data) => {
      if (data) setItems(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = total > 0 ? (total >= 500 ? 0 : 49) : 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const applyCoupon = (code: string): boolean => {
    const upper = code.toUpperCase();
    if (COUPONS[upper] !== undefined) {
      setAppliedCoupon(upper);
      return true;
    }
    return false;
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const discountRate = appliedCoupon ? COUPONS[appliedCoupon] : 0;
  const discount =
    discountRate < 1 ? Math.round(total * discountRate) : discountRate;
  const finalTotal = Math.max(0, total - discount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        appliedCoupon,
        discount,
        applyCoupon,
        removeCoupon,
        finalTotal,
        deliveryFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
