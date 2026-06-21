import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero_banner.png"
          alt="Temptations Cafe ambience"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-green-950/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-green-950/20 to-brand-green-950/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-brand-gold-400 text-sm font-medium tracking-[0.3em] uppercase mb-4 animate-fade-in">
          Kalaburagi's Finest
        </p>
        <h1 className="text-brand-ivory-50 font-display font-black text-5xl md:text-7xl leading-tight mb-6 animate-slide-up">
          Taste Of
          <span className="block text-brand-gold-300">Happiness</span>
        </h1>
        <p className="text-brand-ivory-100/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Premium cafe and restaurant experience. Zinger Burgers, Cheese Burst Pizza, Special Mojitos — every visit is an occasion.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <Link
            href="/reservations"
            className="px-8 py-4 bg-brand-gold-500 text-brand-green-950 font-semibold rounded-xl hover:bg-brand-gold-400 transition-all hover:scale-105 text-base"
          >
            Reserve a Table
          </Link>
          <Link
            href="/menu"
            className="px-8 py-4 bg-transparent border-2 border-brand-gold-500/60 text-brand-ivory-50 font-semibold rounded-xl hover:border-brand-gold-400 hover:bg-brand-green-800/40 transition-all text-base"
          >
            View Menu
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[["500+", "Daily Guests"], ["50+", "Menu Items"], ["4.9★", "Rating"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-brand-gold-300 font-display font-black text-2xl">{val}</p>
              <p className="text-brand-ivory-100/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-ivory-100/40">
        <p className="text-xs tracking-widest uppercase">Scroll</p>
        <div className="w-px h-8 bg-brand-gold-500/40 animate-pulse" />
      </div>
    </section>
  );
}
