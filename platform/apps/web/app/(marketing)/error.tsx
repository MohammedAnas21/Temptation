"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-ivory-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto">!</div>
        <h2 className="font-display font-black text-2xl text-brand-green-900">Something went wrong</h2>
        <p className="text-brand-green-700/60">
          We encountered an unexpected error. Please try again or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-brand-gold-500 text-brand-green-950 font-semibold rounded-xl hover:bg-brand-gold-400 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-brand-ivory-200 text-brand-green-900 font-semibold rounded-xl hover:bg-brand-ivory-100 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
