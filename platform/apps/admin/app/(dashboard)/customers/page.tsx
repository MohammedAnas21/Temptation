"use client";
import { useState, useEffect } from "react";
import { getCustomers, getSegments, type Customer, type Segments } from "@/lib/api";
import { Users, Star, Clock, TrendingUp, Cake } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [segments, setSegments] = useState<Segments | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(q = "") {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "50" };
      if (q) params.search = q;
      const [c, s] = await Promise.all([getCustomers(params), getSegments()]);
      setCustomers(c);
      setSegments(s);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    const t = setTimeout(() => load(e.target.value), 400);
    return () => clearTimeout(t);
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Customers & CRM</h1>

      {/* Segments */}
      {segments && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "VIP",           value: segments.vip,               icon: Star,      color: "text-amber-600 bg-amber-50 border-amber-200" },
            { label: "Inactive",      value: segments.inactive,          icon: Clock,     color: "text-red-600 bg-red-50 border-red-200" },
            { label: "Frequent",      value: segments.frequent,          icon: TrendingUp,color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { label: "New (30d)",     value: segments.new_customers,     icon: Users,     color: "text-blue-600 bg-blue-50 border-blue-200" },
            { label: "Birthdays",     value: segments.birthday_this_month,icon: Cake,     color: "text-purple-600 bg-purple-50 border-purple-200" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl border p-4 ${color}`}>
              <Icon size={16} className="mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="text" placeholder="Search by name, phone, or email…"
        value={search} onChange={handleSearch}
        className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading customers…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Name", "Phone", "Email", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">{c.name ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{c.phone ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <a href={`/dashboard/customers/${c.id}`}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
