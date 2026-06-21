"use client";
import { useState } from "react";
import { exportCustomersCSV, exportOrdersCSV } from "@/lib/api";
import { Download, Users, ShoppingBag, CreditCard } from "lucide-react";

const CUSTOMER_SEGMENTS = [
  { value: "all", label: "All Customers" },
  { value: "vip", label: "VIP Customers" },
  { value: "inactive", label: "Inactive (60+ days)" },
  { value: "frequent", label: "Frequent Visitors" },
  { value: "birthday", label: "Birthday This Month" },
];

export default function ExportsPage() {
  const [segment, setSegment] = useState("all");
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExportCustomers() {
    setExporting("customers");
    try {
      const data = await exportCustomersCSV(segment);
      downloadCSV(data as any, `customers-${segment}-${new Date().toISOString().split("T")[0]}.csv`);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportOrders() {
    setExporting("orders");
    try {
      const data = await exportOrdersCSV();
      downloadCSV(data as any, `orders-${new Date().toISOString().split("T")[0]}.csv`);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(null);
    }
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Download size={22} className="text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Exports</h1>
          <p className="text-slate-500 text-sm">Download CSV reports for customers, orders, and payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Customers Export */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Customers CSV</h3>
            <p className="text-slate-500 text-sm mt-1">Export customer data with segment filtering</p>
          </div>
          <select value={segment} onChange={(e) => setSegment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {CUSTOMER_SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button onClick={handleExportCustomers} disabled={exporting === "customers"}
            className="w-full py-2.5 bg-[#052A16] text-[#F0CC8D] text-sm font-semibold rounded-xl hover:bg-[#0A4424] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            <Download size={14} />
            {exporting === "customers" ? "Exporting…" : "Download CSV"}
          </button>
        </div>

        {/* Orders Export */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Orders CSV</h3>
            <p className="text-slate-500 text-sm mt-1">Export all order data with line items</p>
          </div>
          <div className="h-10" /> {/* Spacer for alignment */}
          <button onClick={handleExportOrders} disabled={exporting === "orders"}
            className="w-full py-2.5 bg-[#052A16] text-[#F0CC8D] text-sm font-semibold rounded-xl hover:bg-[#0A4424] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            <Download size={14} />
            {exporting === "orders" ? "Exporting…" : "Download CSV"}
          </button>
        </div>

        {/* Payments Export */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Payments CSV</h3>
            <p className="text-slate-500 text-sm mt-1">Export payment transactions and settlements</p>
          </div>
          <div className="h-10" />
          <button onClick={() => { alert("Payment export coming soon"); }}
            className="w-full py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
            <Download size={14} />
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
