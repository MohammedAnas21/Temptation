import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Us — Temptations Cafe",
  description: "Discover the story behind Kalaburagi's premier cafe. Luxury dining, legendary flavours, and unforgettable experiences since day one.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Our Story</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">About Temptations</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-brand-green-800 leading-relaxed">
        <p className="text-lg">
          Temptations Cafe is Kalaburagi&apos;s premier destination for luxury dining, artisan coffee,
          and unforgettable experiences. What started as a passion for great food has grown into a
          beloved community gathering place.
        </p>
        <section>
          <h2 className="font-display font-black text-2xl text-brand-green-900 mb-3">Our Mission</h2>
          <p>To deliver happiness through exceptional food, warm hospitality, and a welcoming atmosphere that makes every visit memorable.</p>
        </section>
        <section>
          <h2 className="font-display font-black text-2xl text-brand-green-900 mb-3">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2 text-brand-green-700">
            <li>Signature Zinger Burgers & Cheese Burst Pizzas</li>
            <li>Special Mojitos & artisan beverages</li>
            <li>Premium sofa seating & private dining areas</li>
            <li>Online reservations & loyalty rewards</li>
            <li>Events, celebrations & corporate gatherings</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display font-black text-2xl text-brand-green-900 mb-3">Visit Us</h2>
          <p>Kalaburagi, Karnataka · Open daily 10:00 AM – 11:00 PM</p>
        </section>
      </div>
    </div>
  );
}
