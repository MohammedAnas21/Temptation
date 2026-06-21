"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "@/lib/auth";

const ALLOWED_ROLES = ["staff", "manager", "admin", "super_admin"];
const ADMIN_SESSION_COOKIE = "tc_admin_session";

function setAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=verified; Max-Age=3600; Path=/; SameSite=Lax${
    window.location.protocol === "https:" ? "; Secure" : ""
  }`;
}

function clearAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        clearAdminSessionCookie();
        router.replace("/login");
        return;
      }
      // Verify role against backend
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Profile fetch failed");
        const profile = await res.json();
        if (!ALLOWED_ROLES.includes(profile.role)) {
          clearAdminSessionCookie();
          router.replace("/login?error=unauthorized");
          return;
        }
        setAdminSessionCookie();
        setAuthorized(true);
      } catch {
        clearAdminSessionCookie();
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#052A16] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F0CC8D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#F0CC8D]/60 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;
  return <>{children}</>;
}
