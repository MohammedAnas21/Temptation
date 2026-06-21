"use client";
import { useState, useEffect } from "react";
import { getAuditLogs, type AuditLog } from "@/lib/api";
import { Shield, Filter } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource_type = resourceFilter;
      const data = await getAuditLogs(params);
      setLogs(data);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [actionFilter, resourceFilter]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={22} className="text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 text-sm">Track all administrative actions and changes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="status_change">Status Change</option>
        </select>
        <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Resources</option>
          <option value="order">Orders</option>
          <option value="reservation">Reservations</option>
          <option value="menu_item">Menu Items</option>
          <option value="campaign">Campaigns</option>
          <option value="staff">Staff</option>
          <option value="payment">Payments</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading audit logs…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Timestamp", "Action", "Resource", "Resource ID", "User", "Details"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.action === "create" ? "bg-emerald-100 text-emerald-700" :
                      log.action === "delete" ? "bg-red-100 text-red-700" :
                      log.action === "update" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 capitalize">{log.resource_type}</td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{String(log.resource_id).slice(0, 8)}</td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{String(log.user_id).slice(0, 8)}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs max-w-xs truncate">
                    {typeof log.details === "string" ? log.details : JSON.stringify(log.details).slice(0, 60)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
