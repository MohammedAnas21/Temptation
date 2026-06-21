"use client";
import { useState, useEffect } from "react";
import { getOffers, getCoupons, type Offer, type Coupon } from "@/lib/api";
import { useAuthToken } from "@/lib/useAuth";

export default function OffersPage() {
  const token = useAuthToken();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([getOffers(token), getCoupons(token)])
      .then(([o, c]) => { setOffers(o); setCoupons(c); })
      .catch(() => { setOffers([]); setCoupons([]); })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Offers & Coupons</h1>
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Active Offers</h2>
            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">{o.title}</p>
                  {o.description && <p className="text-sm text-slate-500 mt-1">{o.description}</p>}
                  {o.valid_until && <p className="text-xs text-slate-400 mt-2">Valid until {o.valid_until}</p>}
                </div>
              ))}
              {offers.length === 0 && <p className="text-slate-400 text-sm">No active offers.</p>}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Coupons</h2>
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-mono font-bold text-[#052A16]">{c.code}</p>
                    <p className="text-sm text-slate-500">{c.type} — {c.value}{c.type === "percentage" ? "%" : "₹"} off</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {coupons.length === 0 && <p className="text-slate-400 text-sm">No coupons configured.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
