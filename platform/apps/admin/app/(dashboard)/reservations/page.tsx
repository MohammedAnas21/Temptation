"use client";
import { useState, useEffect } from "react";
import { getReservations, updateReservationStatus, type Reservation } from "@/lib/api";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending:      "bg-yellow-100 text-yellow-800",
  confirmed:    "bg-blue-100 text-blue-800",
  checked_in:   "bg-emerald-100 text-emerald-800",
  checked_out:  "bg-slate-100 text-slate-600",
  cancelled:    "bg-red-100 text-red-700",
  no_show:      "bg-orange-100 text-orange-700",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (dateFilter) params.reservation_date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await getReservations(params);
      setReservations(data);
    } catch { setReservations([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [dateFilter, statusFilter]);

  async function handleAction(id: string, status: string) {
    setUpdating(id);
    try { await updateReservationStatus(id, status); await load(); }
    finally { setUpdating(null); }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-slate-500 text-sm mt-1">{reservations.length} reservation(s) found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
                {["Date", "Time", "Guests", "Seating", "Status", "Deposit", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reservations.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{r.reservation_date}</td>
                  <td className="px-5 py-4 text-slate-600">{r.reservation_time}</td>
                  <td className="px-5 py-4 text-slate-600">{r.guest_count}</td>
                  <td className="px-5 py-4 text-slate-600 capitalize">{r.seating_type.replace("_", " ")}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium ${r.deposit_paid ? "text-emerald-600" : "text-amber-600"}`}>
                      {r.deposit_paid ? `₹${r.deposit_amount} Paid` : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {r.status === "confirmed" && (
                        <button disabled={updating === r.id} onClick={() => handleAction(r.id, "checked_in")}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-40 transition-colors">
                          Check In
                        </button>
                      )}
                      {r.status === "checked_in" && (
                        <button disabled={updating === r.id} onClick={() => handleAction(r.id, "checked_out")}
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors">
                          Check Out
                        </button>
                      )}
                      {["pending","confirmed"].includes(r.status) && (
                        <button disabled={updating === r.id} onClick={() => handleAction(r.id, "cancelled")}
                          className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 disabled:opacity-40 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">No reservations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
