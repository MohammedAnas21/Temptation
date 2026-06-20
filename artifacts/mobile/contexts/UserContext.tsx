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
  tableId?: string;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  seating: "indoor" | "outdoor";
  requests: string;
  status: "confirmed" | "pending" | "cancelled";
  tableId?: string;
}

export interface StoredCredentials {
  phone: string;
  email: string;
  password: string;
}

interface UserContextType {
  profile: UserProfile;
  orders: Order[];
  reservations: Reservation[];
  favorites: string[];
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addOrder: (order: Order) => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  earnPoints: (points: number) => void;
  redeemPoints: (points: number) => boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (profile: Partial<UserProfile>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Guest User",
  phone: "+91 98765 43210",
  email: "guest@email.com",
  loyaltyPoints: 250,
  referralCode: "TEMPT250",
  totalOrders: 0,
};

const AUTH_KEY = "authCredentials";
const AUTH_SESSION_KEY = "isLoggedIn";

export const DEMO_CREDENTIALS: StoredCredentials = {
  phone: "+91 98765 43210",
  email: "demo@temptations.cafe",
  password: "Demo@1234",
};

const DEMO_PROFILE: UserProfile = {
  name: "Demo User",
  phone: DEMO_CREDENTIALS.phone,
  email: DEMO_CREDENTIALS.email,
  loyaltyPoints: 500,
  referralCode: "TEMPTDEMO",
  totalOrders: 3,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function normalizePhone(input: string) {
  return input.replace(/\D/g, "").slice(-10);
}

function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const seedDemoAccount = async () => {
    const existing = await AsyncStorage.getItem(AUTH_KEY);
    if (existing) return;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(DEMO_CREDENTIALS));
    await AsyncStorage.setItem("userProfile", JSON.stringify(DEMO_PROFILE));
  };

  useEffect(() => {
    seedDemoAccount().then(() =>
      Promise.all([
        AsyncStorage.getItem("userProfile"),
        AsyncStorage.getItem("orders"),
        AsyncStorage.getItem("reservations"),
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem(AUTH_SESSION_KEY),
      ]).then(([p, o, r, f, session]) => {
        if (p) setProfile(JSON.parse(p));
        if (o) setOrders(JSON.parse(o));
        if (r) setReservations(JSON.parse(r));
        if (f) setFavorites(JSON.parse(f));
        if (session === "true") setIsAuthenticated(true);
      })
    );
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

  const login = async (identifier: string, password: string): Promise<boolean> => {
    const stored = await AsyncStorage.getItem(AUTH_KEY);
    if (!stored) return false;
    const creds: StoredCredentials = JSON.parse(stored);
    const input = identifier.trim();
    const normalizedInput = normalizePhone(input);
    const normalizedPhone = normalizePhone(creds.phone);
    const matches =
      (isEmail(input) && input.toLowerCase() === creds.email.toLowerCase()) ||
      normalizedInput === normalizedPhone;
    if (matches && creds.password === password) {
      setIsAuthenticated(true);
      await AsyncStorage.setItem(AUTH_SESSION_KEY, "true");
      return true;
    }
    return false;
  };

  const signup = async (updates: Partial<UserProfile>, password: string): Promise<boolean> => {
    if (!updates.phone || !updates.email || !password) return false;
    const newProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      ...updates,
      phone: updates.phone.startsWith("+") ? updates.phone : `+91 ${updates.phone}`,
      loyaltyPoints: 250,
      referralCode: `TEMPT${Math.floor(100 + Math.random() * 900)}`,
      totalOrders: 0,
    };
    const creds: StoredCredentials = {
      phone: newProfile.phone,
      email: newProfile.email,
      password,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(creds));
    await AsyncStorage.setItem("userProfile", JSON.stringify(newProfile));
    await AsyncStorage.setItem(AUTH_SESSION_KEY, "true");
    setProfile(newProfile);
    setIsAuthenticated(true);
    return true;
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        orders,
        reservations,
        favorites,
        isAuthenticated,
        updateProfile,
        addOrder,
        addReservation,
        cancelReservation,
        toggleFavorite,
        isFavorite,
        earnPoints,
        redeemPoints,
        login,
        signup,
        logout,
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
