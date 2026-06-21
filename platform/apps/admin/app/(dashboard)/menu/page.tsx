"use client";
import { useState, useEffect } from "react";
import { getMenuItems, toggleItemAvailability, type MenuItem } from "@/lib/api";
import Image from "next/image";

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID ?? "11111111-1111-1111-1111-111111111111";

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await getMenuItems(BRANCH_ID)); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    try { await toggleItemAvailability(id, !current); await load(); }
    finally { setToggling(null); }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} items</p>
        </div>
        <button className="px-4 py-2.5 bg-[#052A16] text-[#F0CC8D] text-sm font-semibold rounded-xl hover:bg-[#0A4424] transition-colors">
          + Add Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading menu…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${!item.is_available ? "opacity-60" : "border-slate-100"}`}>
              <div className="relative h-36 bg-slate-100">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍽️</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.is_veg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.is_veg ? "VEG" : "NON-VEG"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.name}</h3>
                <p className="text-[#C79A4E] font-bold mt-1">₹{item.price}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-medium ${item.is_available ? "text-emerald-600" : "text-red-500"}`}>
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>
                  <button
                    disabled={toggling === item.id}
                    onClick={() => handleToggle(item.id, item.is_available)}
                    className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-40 ${item.is_available ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.is_available ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-4 text-center py-20 text-slate-400">No menu items found.</div>
          )}
        </div>
      )}
    </div>
  );
}
