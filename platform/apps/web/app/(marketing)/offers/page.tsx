import type { Metadata } from "next";
import { getOffers } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Offers & Deals — Temptations Cafe",
  description: "Current offers, discounts and special deals at Temptations Cafe, Kalaburagi.",
  path: "/offers",
});

export default async function OffersPage() {
  let offers: Awaited<ReturnType<typeof getOffers>> = [];
  try {
    offers = await getOffers();
  } catch {
    offers = [];
  }

  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Special Deals</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Offers</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16">
        {offers.length === 0 ? (
          <p className="text-center text-brand-green-700/60">Check back soon for exciting offers!</p>
        ) : (
          <div className="space-y-6">
            {offers.map((o) => (
              <article key={o.id} className="bg-white rounded-2xl p-6 border border-brand-ivory-200 shadow-sm">
                <h2 className="font-display font-black text-xl text-brand-green-900">{o.title}</h2>
                {o.description && <p className="text-brand-green-700/70 mt-2">{o.description}</p>}
                {o.valid_until && (
                  <p className="text-brand-gold-600 text-sm mt-3">Valid until {new Date(o.valid_until).toLocaleDateString()}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
