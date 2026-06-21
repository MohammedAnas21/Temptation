"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/lib/api";
import { ArrowLeft, Send, Megaphone } from "lucide-react";

const CAMPAIGN_TYPES = [
  { value: "push", label: "Push Notification", icon: "📱" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "sms", label: "SMS", icon: "📩" },
];

const AUDIENCE_TYPES = [
  { value: "all", label: "All Customers" },
  { value: "vip", label: "VIP Customers" },
  { value: "inactive", label: "Inactive (60+ days)" },
  { value: "frequent", label: "Frequent Visitors" },
  { value: "birthday", label: "Birthday This Month" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("push");
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const payload: any = {
        name,
        type,
        audience_type: audience,
        message_template: message,
      };
      if (scheduleDate) payload.scheduled_at = new Date(scheduleDate).toISOString();
      await createCampaign(payload);
      router.push("/campaigns");
    } catch {
      alert("Failed to create campaign");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <a href="/campaigns" className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Campaign</h1>
          <p className="text-slate-500 text-sm">Create and schedule a marketing campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Name</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="e.g., Summer Special Offer"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CAMPAIGN_TYPES.map((ct) => (
                <button key={ct.value} type="button" onClick={() => setType(ct.value)}
                  className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${type === ct.value ? "bg-[#052A16] text-[#F0CC8D] border-[#052A16]" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                  <span className="text-lg block mb-1">{ct.icon}</span>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {AUDIENCE_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Template</label>
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)} required
              rows={4}
              placeholder="Hi {{name}}, check out our special offer..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">Use {"{{name}}"} to personalize with customer name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule (optional)</label>
            <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-1">Leave empty to save as draft</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={sending}
            className="px-6 py-3 bg-[#052A16] text-[#F0CC8D] font-semibold rounded-xl hover:bg-[#0A4424] disabled:opacity-40 transition-colors flex items-center gap-2 text-sm">
            <Megaphone size={15} />
            {sending ? "Creating…" : "Create Campaign"}
          </button>
          <a href="/campaigns"
            className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
