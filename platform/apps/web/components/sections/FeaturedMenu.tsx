import Image from "next/image";
import Link from "next/link";
import { getMenuItems } from "@/lib/api";

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID ?? "11111111-1111-1111-1111-111111111111";

export async function FeaturedMenu() {
  let items = [];
  try {
    items = await getMenuItems(BRANCH_ID, { tag: "recommended" });
    items = items.slice(0, 6);
  } catch {
    // fail silently — show placeholder
  }

  return (
    <section className="py-24 bg-brand-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-gold-500 text-sm font-medium tracking-[0.3em] uppercase mb-3">Our Specialties</p>
          <h2 className="text-brand-green-900 font-display font-black text-4xl md:text-5xl mb-4">
            Chef's Recommendations
          </h2>
          <p className="text-brand-green-700/70 max-w-xl mx-auto">
            Handpicked favourites loved by our regulars. From Zinger Burgers to Cheese Burst Pizzas.
          </p>
        </div>

        {items.length === 0 ? (
          <PlaceholderGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-brand-green-700 text-brand-green-800 font-semibold rounded-xl hover:bg-brand-green-900 hover:text-brand-ivory-50 hover:border-brand-green-900 transition-all"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}

function MenuCard({ item }: { item: any }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-ivory-200 hover:shadow-lg transition-all">
      <div className="relative h-52 bg-brand-ivory-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.is_veg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.is_veg ? "🟢 Veg" : "🔴 Non-Veg"}
          </span>
          {item.is_best_seller && (
            <span className="px-2 py-0.5 bg-brand-gold-500 text-brand-green-950 text-xs font-bold rounded-full">Best Seller</span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-brand-green-900 mb-1">{item.name}</h3>
        <p className="text-brand-green-700/60 text-sm mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-brand-gold-600 font-bold text-lg">₹{item.price}</span>
          <span className="text-brand-green-700/50 text-xs">{item.preparation_time} min</span>
        </div>
      </div>
    </div>
  );
}

function PlaceholderGrid() {
  const placeholders = [
    { name: "Zinger Burger", price: 199, veg: false, emoji: "🍔" },
    { name: "Cheese Burst Pizza", price: 349, veg: true, emoji: "🍕" },
    { name: "Special Mojito", price: 129, veg: true, emoji: "🍹" },
    { name: "Chicken Popcorn", price: 179, veg: false, emoji: "🍗" },
    { name: "Cold Coffee", price: 99, veg: true, emoji: "☕" },
    { name: "Belgian Waffle", price: 149, veg: true, emoji: "🧇" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {placeholders.map((p) => (
        <div key={p.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-ivory-200 hover:shadow-lg transition-all">
          <div className="h-52 bg-brand-ivory-100 flex items-center justify-center text-6xl">{p.emoji}</div>
          <div className="p-5">
            <h3 className="font-display font-bold text-lg text-brand-green-900 mb-1">{p.name}</h3>
            <div className="flex items-center justify-between mt-3">
              <span className="text-brand-gold-600 font-bold text-lg">₹{p.price}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${p.veg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {p.veg ? "🟢 Veg" : "🔴 Non-Veg"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
