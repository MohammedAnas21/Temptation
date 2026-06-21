"use client";
import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, type Order } from "@/lib/api";
import { useAuthToken } from "@/lib/useAuth";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready:     "bg-cyan-100 text-cyan-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Record<string, string> = {
  pending:   "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready:     "delivered",
};

export default function OrdersPage() {
  const token = useAuthToken();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter) params.status = statusFilter;
      setOrders(await getOrders(params, token));
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [statusFilter, token]);

  async function advance(id: string, next: string) {
    if (!token) return;
    setUpdating(id);
    try { await updateOrderStatus(id, next, token); await load(); }
    finally { setUpdating(null); }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} order(s)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Order ID", "Type", "Total", "Payment", "Status", "Time", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}…</td>
                  <td className="px-5 py-4 capitalize text-slate-600">{o.order_type.replace("_", " ")}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">₹{o.total_amount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium ${o.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{new Date(o.created_at).toLocaleTimeString()}</td>
                  <td className="px-5 py-4">
                    {NEXT_STATUS[o.status] && (
                      <button disabled={updating === o.id} onClick={() => advance(o.id, NEXT_STATUS[o.status])}
                        className="px-3 py-1.5 bg-[#052A16] text-[#F0CC8D] text-xs font-semibold rounded-lg hover:bg-[#0A4424] disabled:opacity-40 transition-colors capitalize">
                        → {NEXT_STATUS[o.status]}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
