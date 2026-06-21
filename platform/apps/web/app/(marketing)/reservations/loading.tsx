export default function ReservationsLoading() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Book Your Spot</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Reserve a Table</h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-ivory-200 space-y-6 animate-pulse">
          <div className="h-7 w-48 bg-brand-ivory-100 rounded" />
          <div className="h-4 w-64 bg-brand-ivory-100 rounded" />
          <div className="h-12 bg-brand-ivory-100 rounded-xl" />
          <div className="h-14 bg-brand-ivory-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
