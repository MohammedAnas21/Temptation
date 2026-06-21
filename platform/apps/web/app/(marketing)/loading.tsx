export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-ivory-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-brand-green-700/50 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
