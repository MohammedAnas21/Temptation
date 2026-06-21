"use client";
import { useState, useEffect, use } from "react";
import { getCustomerDetail, getCustomerTimeline, getCustomerCLV, type CustomerDetail, type TimelineEvent, type CLVData } from "@/lib/api";
import { ArrowLeft, ShoppingBag, Calendar, Star, TrendingUp } from "lucide-react";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [clv, setClv] = useState<CLVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, t, c] = await Promise.all([
          getCustomerDetail(id),
          getCustomerTimeline(id),
          getCustomerCLV(id),
        ]);
        setDetail(d);
        setTimeline(t);
        setClv(c);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-400 py-20">Loading customer…</div>;
  if (!detail) return <div className="p-8 text-center text-slate-400 py-20">Customer not found.</div>;

  const { profile } = detail;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <a href="/customers" className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.name ?? "Customer"}</h1>
          <p className="text-slate-500 text-sm">{profile.phone} · {profile.email}</p>
        </div>
      </div>

      {/* CLV Cards */}
      {clv && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Revenue" value={`₹${clv.total_revenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-600 bg-emerald-50" />
          <MetricCard label="Orders" value={String(clv.order_count)} icon={ShoppingBag} color="text-blue-600 bg-blue-50" />
          <MetricCard label="Avg Order Value" value={`₹${clv.avg_order_value.toFixed(0)}`} icon={Star} color="text-amber-600 bg-amber-50" />
          <MetricCard label="Visits" value={String(clv.visit_count)} icon={Calendar} color="text-purple-600 bg-purple-50" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Orders</h2>
          {detail.recent_orders.length === 0 ? (
            <p className="text-slate-400 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {detail.recent_orders.slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">#{String(o.id).slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">₹{o.total_amount}</p>
                    <p className={`text-xs capitalize ${o.status === "delivered" ? "text-emerald-600" : "text-amber-600"}`}>{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Reservations</h2>
          {detail.recent_reservations.length === 0 ? (
            <p className="text-slate-400 text-sm">No reservations yet.</p>
          ) : (
            <div className="space-y-3">
              {detail.recent_reservations.slice(0, 5).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.reservation_date} at {String(r.reservation_time).slice(0, 5)}</p>
                    <p className="text-xs text-slate-400">{r.guest_count} guests</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${r.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Activity Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-slate-400 text-sm">No activity recorded.</p>
        ) : (
          <div className="space-y-4">
            {timeline.slice(0, 20).map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-800">{event.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(event.event_date).toLocaleDateString()} · {event.event_type}
                    {event.amount ? ` · ₹${event.amount}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <Icon size={16} className="mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}
