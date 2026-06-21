export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Our Menu</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">
          What Would You Like?
        </h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {[1, 2].map((section) => (
          <div key={section} className="mb-16">
            <div className="h-8 w-40 bg-brand-ivory-200 rounded-lg animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-brand-ivory-200 animate-pulse">
                  <div className="h-40 bg-brand-ivory-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-brand-ivory-100 rounded w-3/4" />
                    <div className="h-3 bg-brand-ivory-100 rounded w-full" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-brand-ivory-100 rounded w-12" />
                      <div className="h-3 bg-brand-ivory-100 rounded w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
