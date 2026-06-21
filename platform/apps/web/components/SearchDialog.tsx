"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchMenuItems, type MenuItem } from "@/lib/api";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResults([]); return; }
      setLoading(true);
      try {
        const items = await searchMenuItems(q);
        setResults(items);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300),
    [],
  );

  useEffect(() => { debouncedSearch(query); }, [query, debouncedSearch]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-brand-green-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-brand-ivory-200 overflow-hidden">
        <div className="flex items-center px-5 py-4 border-b border-brand-ivory-200">
          <span className="text-brand-green-700/40 mr-3">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu items..."
            className="flex-1 text-brand-green-900 placeholder:text-brand-green-700/40 focus:outline-none text-lg"
          />
          <button onClick={onClose} className="text-brand-green-700/40 hover:text-brand-green-900 ml-3 text-sm">
            ESC
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="text-center py-8 text-brand-green-700/40 text-sm">Searching...</div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-brand-green-700/40 text-sm">No items found for &quot;{query}&quot;</div>
          )}
          {!loading && results.map((item) => (
            <button
              key={item.id}
              onClick={() => { router.push("/menu"); onClose(); }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-brand-ivory-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-ivory-100 flex items-center justify-center text-lg flex-shrink-0">
                {item.is_veg ? "🥬" : "🍗"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-brand-green-900 font-medium text-sm truncate">{item.name}</p>
                {item.description && (
                  <p className="text-brand-green-700/50 text-xs truncate">{item.description}</p>
                )}
              </div>
              <span className="text-brand-gold-600 font-bold text-sm flex-shrink-0">₹{item.price}</span>
            </button>
          ))}
          {!loading && query.length < 2 && (
            <div className="text-center py-8 text-brand-green-700/40 text-sm">Type at least 2 characters to search</div>
          )}
        </div>
      </div>
    </div>
  );
}

function debounce<T extends (...args: string[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
