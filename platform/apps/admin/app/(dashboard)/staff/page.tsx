"use client";
import { useState, useEffect } from "react";
import { getStaff, type StaffMember } from "@/lib/api";
import { useAuthToken } from "@/lib/useAuth";

const ROLE_COLORS: Record<string, string> = {
  staff: "bg-blue-100 text-blue-800",
  manager: "bg-purple-100 text-purple-800",
  admin: "bg-amber-100 text-amber-800",
  super_admin: "bg-red-100 text-red-800",
};

export default function StaffPage() {
  const token = useAuthToken();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getStaff(token)
      .then(setStaff)
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Staff Management</h1>
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Name", "Phone", "Role", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">{s.name}</td>
                  <td className="px-5 py-4 text-slate-600">{s.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[s.role] ?? "bg-slate-100"}`}>
                      {s.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium ${s.is_active ? "text-emerald-600" : "text-slate-400"}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={4} className="text-center py-16 text-slate-400">No staff members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
