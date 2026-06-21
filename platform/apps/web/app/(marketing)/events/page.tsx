import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Events — Temptations Cafe",
  description: "Host birthdays, anniversaries, corporate events and celebrations at Temptations Cafe, Kalaburagi.",
  path: "/events",
});

const EVENTS = [
  { title: "Live Music Fridays", date: "Every Friday, 7 PM", desc: "Enjoy live acoustic performances with your favourite drinks." },
  { title: "Birthday Packages", date: "Available daily", desc: "Customised birthday setups with cakes, décor and special menus." },
  { title: "Corporate Meetups", date: "Weekdays", desc: "Private dining areas for team lunches and business meetings." },
  { title: "Anniversary Dinners", date: "By reservation", desc: "Romantic setups with curated menus for special occasions." },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Celebrate With Us</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Events</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        {EVENTS.map((e) => (
          <article key={e.title} className="bg-white rounded-2xl p-6 border border-brand-ivory-200 shadow-sm">
            <p className="text-brand-gold-600 text-sm font-medium">{e.date}</p>
            <h2 className="font-display font-black text-xl text-brand-green-900 mt-1">{e.title}</h2>
            <p className="text-brand-green-700/70 mt-2">{e.desc}</p>
          </article>
        ))}
        <div className="text-center pt-8">
          <Link href="/contact" className="inline-block px-8 py-4 bg-brand-gold-500 text-brand-green-950 font-semibold rounded-xl hover:bg-brand-gold-400 transition-colors">
            Enquire About Events
          </Link>
        </div>
      </div>
    </div>
  );
}
