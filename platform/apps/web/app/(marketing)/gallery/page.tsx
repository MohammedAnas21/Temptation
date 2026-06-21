import Image from "next/image";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Gallery — Temptations Cafe",
  description: "Browse photos of our dishes, ambience, and events at Temptations Cafe, Kalaburagi.",
  path: "/gallery",
});

const GALLERY = [
  { title: "Signature Zinger Burger", category: "Food", emoji: "🍔" },
  { title: "Cheese Burst Pizza", category: "Food", emoji: "🍕" },
  { title: "Special Mojito", category: "Beverages", emoji: "🍹" },
  { title: "Premium Sofa Seating", category: "Ambience", emoji: "🛋️" },
  { title: "Private Dining Area", category: "Ambience", emoji: "🕯️" },
  { title: "Birthday Celebration", category: "Events", emoji: "🎂" },
  { title: "Live Music Night", category: "Events", emoji: "🎵" },
  { title: "Outdoor Seating", category: "Ambience", emoji: "🌿" },
  { title: "Chef's Special Platter", category: "Food", emoji: "🍽️" },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Visual Feast</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Gallery</h1>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY.map((item, i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-green-900/5 border border-brand-ivory-200 hover:shadow-lg transition-shadow">
              {/* Placeholder with emoji until real images are added */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green-900/10 to-brand-gold-500/10 flex items-center justify-center">
                <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-green-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-brand-gold-400 text-xs uppercase tracking-wider">{item.category}</span>
                <p className="text-white font-semibold mt-1">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-brand-green-700/40 text-sm mt-10">
          Follow us on Instagram for more photos and behind-the-scenes content.
        </p>
      </div>
    </div>
  );
}
