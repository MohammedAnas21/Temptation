"use client";
import { useState, useEffect } from "react";
import { getTables, updateTableStatus, type Table } from "@/lib/api";

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID ?? "11111111-1111-1111-1111-111111111111";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  available:    { label: "Available",    color: "text-emerald-700", bg: "bg-emerald-100" },
  reserved:     { label: "Reserved",     color: "text-amber-700",   bg: "bg-amber-100" },
  occupied:     { label: "Occupied",     color: "text-red-700",     bg: "bg-red-100" },
  cleaning:     { label: "Cleaning",     color: "text-blue-700",    bg: "bg-blue-100" },
  out_of_service: { label: "Out of Service", color: "text-slate-500", bg: "bg-slate-100" },
};

const STATUSES = Object.keys(STATUS_CONFIG);

const TABLE_TYPE_LABELS: Record<string, string> = {
  standard:     "Standard",
  dining:       "Dining",
  premium_sofa: "Premium Sofa",
  private_sofa: "Private Sofa",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getTables(BRANCH_ID);
      setTables(data);
    } catch { /* show empty */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, []);

  async function handleStatusChange(tableId: string, status: string) {
    setUpdating(tableId);
    try {
      await updateTableStatus(tableId, status);
      await load();
    } finally { setUpdating(null); }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Table Management</h1>
          <p className="text-slate-500 text-sm mt-1">Live status board — auto-refreshes every 30s</p>
        </div>
        <button onClick={load} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors">
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading tables…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tables.map((table) => {
            const cfg = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.available;
            return (
              <div key={table.id} className={`bg-white rounded-2xl border-2 ${table.status === "available" ? "border-emerald-200" : table.status === "occupied" ? "border-red-200" : table.status === "reserved" ? "border-amber-200" : "border-slate-200"} p-5 shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Table {table.table_number}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{TABLE_TYPE_LABELS[table.table_type]} · {table.capacity} guests</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>

                {/* Status override */}
                <div className="mt-3">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Change status:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.filter(s => s !== table.status).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(table.id, s)}
                        disabled={updating === table.id}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-transparent hover:border-current`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {tables.length === 0 && (
            <div className="col-span-3 text-center py-20 text-slate-400">No tables configured.</div>
          )}
        </div>
      )}
    </div>
  );
}
