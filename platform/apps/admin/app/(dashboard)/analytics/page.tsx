"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { getRevenue, getTopCustomers, getPopularItems, type RevenueData, type TopCustomer, type PopularItem } from "@/lib/api";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("week");
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [rev, cust, itms] = await Promise.all([
        getRevenue(period),
        getTopCustomers(),
        getPopularItems(),
      ]);
      setRevenue(rev);
      setCustomers(cust);
      setItems(itms);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [period]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <div className="flex gap-2">
          {["today","week","month","year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? "bg-[#052A16] text-[#F0CC8D]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading analytics…</div>
      ) : (
        <>
          {/* Summary KPIs */}
          {revenue && (
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-sm">Total Revenue ({period})</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">₹{revenue.total_revenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-sm">Total Orders ({period})</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{revenue.total_orders}</p>
              </div>
            </div>
          )}

          {/* Revenue Chart */}
          {revenue && revenue.daily.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-5">Daily Revenue</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenue.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#052A16" strokeWidth={2.5} dot={{ fill: "#F0CC8D", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Popular Items */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-5">Popular Menu Items</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={items.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total_ordered" fill="#052A16" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Customers */}
          {customers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Top Customers</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["#","Name","Phone","Orders","Total Spend"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customers.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{c.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500">{c.phone}</td>
                      <td className="px-5 py-3.5 text-slate-600">{c.orders}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">₹{c.total_spend.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
