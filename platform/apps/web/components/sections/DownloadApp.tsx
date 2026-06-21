const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? "#";
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "#";

export function DownloadApp() {
  return (
    <section className="py-24 bg-brand-green-900 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-brand-gold-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Mobile App</p>
            <h2 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl mb-5 leading-tight">
              Order & Reserve
              <span className="block text-brand-gold-300">From Your Phone</span>
            </h2>
            <p className="text-brand-ivory-100/70 text-lg mb-8 leading-relaxed max-w-lg">
              Download the Temptations app to order food, reserve tables, earn loyalty points, and get exclusive offers — all in one place.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Real-time table availability",
                "Order tracking with live updates",
                "Loyalty points & rewards",
                "Exclusive app-only offers",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-brand-ivory-100/80">
                  <span className="w-5 h-5 rounded-full bg-brand-gold-500/20 border border-brand-gold-500/40 flex items-center justify-center text-brand-gold-300 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-brand-ivory-50 text-brand-green-950 rounded-xl hover:bg-brand-gold-300 transition-colors"
              >
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-xs opacity-60">Download on the</p>
                  <p className="font-bold text-sm">App Store</p>
                </div>
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-brand-ivory-50 text-brand-green-950 rounded-xl hover:bg-brand-gold-300 transition-colors"
              >
                <span className="text-2xl">▶️</span>
                <div>
                  <p className="text-xs opacity-60">Get it on</p>
                  <p className="font-bold text-sm">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex-shrink-0 w-64">
            <div className="relative mx-auto w-48 h-96 bg-brand-green-800 rounded-[2.5rem] border-4 border-brand-green-700 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-gold-500/20 border border-brand-gold-500/30 flex items-center justify-center text-3xl">🍽️</div>
                <p className="text-brand-gold-300 font-display font-black text-lg tracking-wider text-center">TEMPTATIONS</p>
                <p className="text-brand-ivory-100/50 text-xs text-center">Taste Of Happiness</p>
                <div className="w-full space-y-2 mt-4">
                  {["Order Food", "Reserve Table", "My Points"].map((item) => (
                    <div key={item} className="w-full bg-brand-green-700/60 rounded-lg px-3 py-2 text-brand-ivory-100/70 text-xs text-center">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
