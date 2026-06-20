import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  referralCode: string;
  totalOrders: number;
}

export interface Order {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "placed" | "preparing" | "ready" | "delivered";
  pointsEarned: number;
  type: "delivery" | "dine-in";
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  seating: "indoor" | "outdoor";
  requests: string;
  status: "confirmed" | "pending" | "cancelled";
}

interface UserContextType {
  profile: UserProfile;
  orders: Order[];
  reservations: Reservation[];
  favorites: string[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  addOrder: (order: Order) => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  earnPoints: (points: number) => void;
  redeemPoints: (points: number) => boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Guest User",
  phone: "+91 98765 43210",
  email: "guest@email.com",
  loyaltyPoints: 250,
  referralCode: "TEMPT250",
  totalOrders: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("userProfile"),
      AsyncStorage.getItem("orders"),
      AsyncStorage.getItem("reservations"),
      AsyncStorage.getItem("favorites"),
    ]).then(([p, o, r, f]) => {
      if (p) setProfile(JSON.parse(p));
      if (o) setOrders(JSON.parse(o));
      if (r) setReservations(JSON.parse(r));
      if (f) setFavorites(JSON.parse(f));
    });
  }, []);

  const persist = (key: string, value: unknown) =>
    AsyncStorage.setItem(key, JSON.stringify(value));

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      persist("userProfile", next);
      return next;
    });
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => {
      const next = [order, ...prev];
      persist("orders", next);
      return next;
    });
    earnPoints(Math.floor(order.total / 10));
    updateProfile({ totalOrders: profile.totalOrders + 1 });
  };

  const addReservation = (r: Reservation) => {
    setReservations((prev) => {
      const next = [r, ...prev];
      persist("reservations", next);
      return next;
    });
  };

  const cancelReservation = (id: string) => {
    setReservations((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: "cancelled" as const } : r
      );
      persist("reservations", next);
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      persist("favorites", next);
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const earnPoints = (points: number) => {
    updateProfile({ loyaltyPoints: profile.loyaltyPoints + points });
  };

  const redeemPoints = (points: number): boolean => {
    if (profile.loyaltyPoints < points) return false;
    updateProfile({ loyaltyPoints: profile.loyaltyPoints - points });
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        orders,
        reservations,
        favorites,
        updateProfile,
        addOrder,
        addReservation,
        cancelReservation,
        toggleFavorite,
        isFavorite,
        earnPoints,
        redeemPoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
