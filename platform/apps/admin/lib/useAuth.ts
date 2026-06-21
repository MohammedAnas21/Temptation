"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdToken } from "@/lib/auth";

export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (user) {
        setToken(await user.getIdToken());
      } else {
        setToken(null);
      }
    });
    return () => unsub();
  }, []);

  return token;
}

export async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  if (!token) throw new Error("Not authenticated");
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json() as Promise<T>;
}
