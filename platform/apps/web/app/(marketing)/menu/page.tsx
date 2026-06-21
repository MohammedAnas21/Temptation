import Image from "next/image";
import { getCategories, getMenuItems, type MenuItem, type MenuCategory } from "@/lib/api";
import { buildMetadata, menuItemSchema } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Menu",
  description: "Explore our full menu — Cold Coffee, Pizza, Burgers, Mojitos, Waffles, and more at Temptations Cafe, Kalaburagi.",
  path: "/menu",
});

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID ?? "11111111-1111-1111-1111-111111111111";

export default async function MenuPage() {
  let categories: MenuCategory[] = [];
  let items: MenuItem[] = [];

  try {
    [categories, items] = await Promise.all([
      getCategories(BRANCH_ID),
      getMenuItems(BRANCH_ID),
    ]);
  } catch {}

  const itemsByCategory = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.id] = items.filter((i) => i.category_id === cat.id);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-brand-ivory-50">
      {/* Header */}
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Our Menu</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">
          What Would You Like?
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <p className="text-center text-brand-green-700/50 py-20">Menu coming soon…</p>
        ) : (
          categories.map((cat) => {
            const catItems = itemsByCategory[cat.id] ?? [];
            if (catItems.length === 0) return null;
            return (
              <section key={cat.id} id={cat.slug} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-brand-green-900 font-display font-black text-2xl md:text-3xl">{cat.name}</h2>
                  <div className="flex-1 h-px bg-brand-gold-500/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {catItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
                {/* Schema markup */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(catItems.map(menuItemSchema)) }}
                />
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-brand-ivory-200 hover:shadow-md transition-all group">
      <div className="relative h-40 bg-brand-ivory-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🍽️</div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.is_veg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.is_veg ? "VEG" : "NON-VEG"}
          </span>
        </div>
        {item.is_best_seller && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-brand-gold-500 text-brand-green-950 text-[10px] font-bold rounded-full">⭐ BEST SELLER</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-brand-green-900 text-base mb-1 line-clamp-1">{item.name}</h3>
        {item.description && (
          <p className="text-brand-green-700/60 text-xs mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-brand-gold-600 font-bold">₹{item.price}</span>
          <span className="text-brand-green-700/40 text-xs">{item.preparation_time}m</span>
        </div>
      </div>
    </div>
  );
}
