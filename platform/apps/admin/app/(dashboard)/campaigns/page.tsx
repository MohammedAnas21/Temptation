"use client";
import { useState, useEffect } from "react";
import { getCampaigns, sendCampaign, type Campaign } from "@/lib/api";
import { Send, Clock, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  draft:     { icon: Clock, color: "text-slate-500 bg-slate-100" },
  scheduled: { icon: Clock, color: "text-amber-600 bg-amber-100" },
  sending:   { icon: Send, color: "text-blue-600 bg-blue-100" },
  sent:      { icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
  failed:    { icon: AlertCircle, color: "text-red-600 bg-red-100" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setCampaigns(await getCampaigns()); }
    catch { setCampaigns([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSend(id: string) {
    setSending(id);
    try { await sendCampaign(id); await load(); }
    catch { alert("Send failed"); }
    finally { setSending(null); }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">WhatsApp and push notification campaigns</p>
        </div>
        <a href="/dashboard/campaigns/new"
          className="px-4 py-2.5 bg-[#052A16] text-[#F0CC8D] text-sm font-semibold rounded-xl hover:bg-[#0A4424] transition-colors">
          + New Campaign
        </a>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading campaigns…</div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
            const Icon = cfg.icon;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center`}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{c.type} campaign · {c.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>{c.status}</span>
                  {["draft", "scheduled"].includes(c.status) && (
                    <button
                      disabled={sending === c.id}
                      onClick={() => handleSend(c.id)}
                      className="px-4 py-2 bg-[#052A16] text-[#F0CC8D] text-xs font-semibold rounded-xl hover:bg-[#0A4424] disabled:opacity-40 transition-colors flex items-center gap-2"
                    >
                      <Send size={13} />
                      {sending === c.id ? "Sending…" : "Send Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && (
            <div className="text-center py-20 text-slate-400">No campaigns yet. Create your first campaign.</div>
          )}
        </div>
      )}
    </div>
  );
}
