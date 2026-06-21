"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithEmail } from "@/lib/auth";

const ALLOWED_ROLES = ["staff", "manager", "admin", "super_admin"];
const ADMIN_SESSION_COOKIE = "tc_admin_session";

function setAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=verified; Max-Age=3600; Path=/; SameSite=Lax${
    window.location.protocol === "https:" ? "; Secure" : ""
  }`;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await loginWithEmail(email, password);
      const token = await credential.user.getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Unable to verify admin access");
      const profile = await res.json();
      if (!ALLOWED_ROLES.includes(profile.role)) {
        throw new Error("This account is not authorized for the admin dashboard");
      }
      setAdminSessionCookie();
      router.replace(searchParams.get("next") ?? "/");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#052A16] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-[#F0CC8D] font-black text-2xl tracking-[0.3em]">TEMPTATIONS</p>
          <p className="text-[#F0CC8D]/50 text-xs tracking-wider mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0A4424] rounded-2xl p-8 border border-[#F0CC8D]/10 space-y-5">
          <h1 className="text-white font-bold text-xl text-center">Sign In</h1>

          {error && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="text-[#F0CC8D]/70 text-xs font-medium uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#052A16] border border-[#F0CC8D]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0CC8D]/40"
              placeholder="admin@temptationscafe.in"
            />
          </div>

          <div>
            <label className="text-[#F0CC8D]/70 text-xs font-medium uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#052A16] border border-[#F0CC8D]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0CC8D]/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#F0CC8D] text-[#052A16] font-bold rounded-xl hover:bg-[#DDB56C] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
