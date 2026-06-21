"use client";
import { useState, useEffect } from "react";
import { getRevenue, getOrders, getReservations, getCustomers } from "@/lib/api";
import { TrendingUp, ShoppingBag, Calendar, Users } from "lucide-react";

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-slate-500 text-sm mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardOverview() {
  const [revenue, setRevenue] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [reservationCount, setReservationCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rev, orders, reservations, customers] = await Promise.allSettled([
          getRevenue("day"),
          getOrders({ limit: "1", skip: "0" }),
          getReservations({ limit: "1", status: "confirmed" }),
          getCustomers({ limit: "1" }),
        ]);
        if (rev.status === "fulfilled") setRevenue(rev.value.total_revenue);
        if (orders.status === "fulfilled") setOrderCount((orders.value as any).length ?? 0);
        if (reservations.status === "fulfilled") setReservationCount((reservations.value as any).length ?? 0);
        if (customers.status === "fulfilled") setCustomerCount((customers.value as any).length ?? 0);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const fmt = (n: number | null) => {
    if (n === null) return "—";
    return n.toLocaleString("en-IN");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Good morning 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening at Temptations Cafe today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Today's Revenue" value={`₹${fmt(revenue)}`} sub="Live from orders" icon={TrendingUp} color="bg-emerald-500" />
        <KpiCard label="Orders Today" value={fmt(orderCount)} sub="Pending + delivered" icon={ShoppingBag} color="bg-blue-500" />
        <KpiCard label="Reservations" value={fmt(reservationCount)} sub="Confirmed today" icon={Calendar} color="bg-amber-500" />
        <KpiCard label="Active Customers" value={fmt(customerCount)} sub="Visited this month" icon={Users} color="bg-purple-500" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Today's Reservations", desc: "View and manage all reservations for today", href: "/reservations", color: "border-l-amber-400" },
          { title: "Live Table Status", desc: "Check and update table statuses in real-time", href: "/tables", color: "border-l-blue-400" },
          { title: "Orders Queue", desc: "View incoming orders and update kitchen status", href: "/orders", color: "border-l-emerald-400" },
        ].map((card) => (
          <a key={card.href} href={card.href}
            className={`bg-white rounded-2xl p-5 border border-slate-100 border-l-4 ${card.color} shadow-sm hover:shadow-md transition-shadow`}>
            <h3 className="font-semibold text-slate-900">{card.title}</h3>
            <p className="text-slate-500 text-sm mt-1">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
import { TrendingUp, ShoppingBag, Calendar, Users } from "lucide-react";

// KPI card
function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-slate-500 text-sm mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Good morning 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening at Temptations Cafe today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Today's Revenue" value="₹—" sub="Live from orders" icon={TrendingUp} color="bg-emerald-500" />
        <KpiCard label="Orders Today"    value="—"  sub="Pending + delivered"   icon={ShoppingBag} color="bg-blue-500" />
        <KpiCard label="Reservations"    value="—"  sub="Confirmed today"        icon={Calendar}    color="bg-amber-500" />
        <KpiCard label="Active Customers" value="—" sub="Visited this month"    icon={Users}       color="bg-purple-500" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Today's Reservations", desc: "View and manage all reservations for today", href: "/dashboard/reservations", color: "border-l-amber-400" },
          { title: "Live Table Status",    desc: "Check and update table statuses in real-time", href: "/dashboard/tables",       color: "border-l-blue-400" },
          { title: "Orders Queue",         desc: "View incoming orders and update kitchen status", href: "/dashboard/orders",     color: "border-l-emerald-400" },
        ].map((card) => (
          <a key={card.href} href={card.href}
            className={`bg-white rounded-2xl p-5 border border-slate-100 border-l-4 ${card.color} shadow-sm hover:shadow-md transition-shadow`}>
            <h3 className="font-semibold text-slate-900">{card.title}</h3>
            <p className="text-slate-500 text-sm mt-1">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
