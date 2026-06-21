"use client";
import { useState } from "react";
import { buildMetadata } from "@/lib/seo";
import { getTableAvailability, type Table } from "@/lib/api";

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID ?? "11111111-1111-1111-1111-111111111111";
const SEATING_TYPES = ["Standard", "Dining", "Premium Sofa", "Private Sofa"];
const TIME_SLOTS = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

type Step = "date" | "time" | "guests" | "seating" | "table" | "confirm";

export default function ReservationsPage() {
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const today = new Date().toISOString().split("T")[0];

  async function fetchTables() {
    setLoading(true);
    try {
      const available = await getTableAvailability(BRANCH_ID, date, time + ":00", guests);
      setTables(available);
    } catch {
      setTables([]);
    } finally {
      setLoading(false);
    }
  }

  function nextStep(next: Step) {
    if (next === "table") fetchTables();
    setStep(next);
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-brand-ivory-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-lg border border-brand-ivory-200">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
          <h2 className="text-brand-green-900 font-display font-black text-3xl mb-3">Reservation Confirmed!</h2>
          <p className="text-brand-green-700/70 mb-6">
            Your table for <strong>{guests}</strong> guests on <strong>{date}</strong> at <strong>{time}</strong> is confirmed. A WhatsApp confirmation will be sent to your number.
          </p>
          <button onClick={() => { setConfirmed(false); setStep("date"); }}
            className="px-6 py-3 bg-brand-gold-500 text-brand-green-950 font-semibold rounded-xl hover:bg-brand-gold-400 transition-colors">
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Book Your Spot</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Reserve a Table</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10">
          {(["date","time","guests","seating","table","confirm"] as Step[]).map((s, i) => (
            <div key={s} className={`flex items-center gap-1 ${i < (["date","time","guests","seating","table","confirm"] as Step[]).indexOf(step) ? "text-brand-gold-500" : s === step ? "text-brand-green-900 font-bold" : "text-brand-green-700/30"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${s === step ? "bg-brand-green-900 text-white border-brand-green-900" : i < (["date","time","guests","seating","table","confirm"] as Step[]).indexOf(step) ? "bg-brand-gold-500 text-white border-brand-gold-500" : "border-brand-green-300"}`}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-ivory-200">
          {step === "date" && (
            <StepCard title="Select a Date" subtitle="When would you like to visit?">
              <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-brand-ivory-200 rounded-xl px-4 py-3 text-brand-green-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500" />
              <StepBtn disabled={!date} onClick={() => nextStep("time")}>Continue</StepBtn>
            </StepCard>
          )}

          {step === "time" && (
            <StepCard title="Select a Time" subtitle="Choose your preferred time slot.">
              <div className="grid grid-cols-3 gap-3">
                {TIME_SLOTS.map((t) => (
                  <button key={t} onClick={() => setTime(t)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${time === t ? "bg-brand-green-900 text-white border-brand-green-900" : "border-brand-ivory-200 text-brand-green-800 hover:border-brand-gold-500"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <StepBtn disabled={!time} onClick={() => nextStep("guests")}>Continue</StepBtn>
            </StepCard>
          )}

          {step === "guests" && (
            <StepCard title="Number of Guests" subtitle="How many people will be dining?">
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-12 h-12 rounded-full bg-brand-ivory-100 text-brand-green-900 text-2xl font-bold hover:bg-brand-gold-500 hover:text-white transition-colors">−</button>
                <span className="text-4xl font-display font-black text-brand-green-900 w-12 text-center">{guests}</span>
                <button onClick={() => setGuests(Math.min(8, guests + 1))}
                  className="w-12 h-12 rounded-full bg-brand-ivory-100 text-brand-green-900 text-2xl font-bold hover:bg-brand-gold-500 hover:text-white transition-colors">+</button>
              </div>
              <StepBtn onClick={() => nextStep("seating")}>Continue</StepBtn>
            </StepCard>
          )}

          {step === "seating" && (
            <StepCard title="Seating Preference" subtitle="Select your preferred seating type.">
              <div className="grid grid-cols-2 gap-3">
                {SEATING_TYPES.map((s) => (
                  <button key={s} onClick={() => setSeating(s)}
                    className={`py-4 rounded-xl border text-sm font-medium transition-all ${seating === s ? "bg-brand-green-900 text-white border-brand-green-900" : "border-brand-ivory-200 text-brand-green-800 hover:border-brand-gold-500"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <StepBtn disabled={!seating} onClick={() => nextStep("table")}>Find Tables</StepBtn>
            </StepCard>
          )}

          {step === "table" && (
            <StepCard title="Select a Table" subtitle={loading ? "Finding available tables…" : `${tables.length} table(s) available`}>
              {loading ? (
                <div className="text-center py-8 text-brand-green-700/50">Checking availability…</div>
              ) : tables.length === 0 ? (
                <div className="text-center py-8 text-brand-green-700/50">No tables available for this slot. Please try a different time.</div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {tables.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTable(t)}
                      className={`p-3 rounded-xl border text-sm transition-all ${selectedTable?.id === t.id ? "bg-brand-green-900 text-white border-brand-green-900" : "border-brand-ivory-200 hover:border-brand-gold-500"}`}>
                      <p className="font-bold">Table {t.table_number}</p>
                      <p className="text-xs opacity-70">{t.capacity} guests</p>
                    </button>
                  ))}
                </div>
              )}
              <StepBtn disabled={!selectedTable} onClick={() => nextStep("confirm")}>Continue</StepBtn>
            </StepCard>
          )}

          {step === "confirm" && (
            <StepCard title="Confirm Reservation" subtitle="Enter your details to complete the booking.">
              <div className="bg-brand-ivory-50 rounded-xl p-4 mb-4 text-sm space-y-1 text-brand-green-800">
                <p><strong>Date:</strong> {date}</p>
                <p><strong>Time:</strong> {time}</p>
                <p><strong>Guests:</strong> {guests}</p>
                <p><strong>Seating:</strong> {seating}</p>
                <p><strong>Table:</strong> Table {selectedTable?.table_number}</p>
                <p><strong>Advance Deposit:</strong> ₹200</p>
              </div>
              <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-brand-ivory-200 rounded-xl px-4 py-3 mb-3 text-brand-green-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500" />
              <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-brand-ivory-200 rounded-xl px-4 py-3 mb-4 text-brand-green-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500" />
              <StepBtn disabled={!name || !phone} onClick={() => setConfirmed(true)}>Confirm & Pay ₹200</StepBtn>
            </StepCard>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-brand-green-900 font-display font-black text-2xl">{title}</h2>
        <p className="text-brand-green-700/60 text-sm mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function StepBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 bg-brand-gold-500 text-brand-green-950 font-semibold rounded-xl hover:bg-brand-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2">
      {children}
    </button>
  );
}
