"use client";
import { useState, useEffect } from "react";
import { getPayments, type PaymentRecord } from "@/lib/api";
import { useAuthToken } from "@/lib/useAuth";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-600",
};

export default function PaymentsPage() {
  const token = useAuthToken();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getPayments({ limit: "100" }, token)
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payments</h1>
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Payment ID", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.id.slice(0, 8)}…</td>
                  <td className="px-5 py-4 font-semibold">₹{p.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] ?? "bg-slate-100"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={4} className="text-center py-16 text-slate-400">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
