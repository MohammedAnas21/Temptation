"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reserve" },
  { href: "/events", label: "Events" },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-green-900/95 backdrop-blur-sm border-b border-brand-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-brand-green-800">
              <Image src="/logo.png" alt="Temptations Cafe" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="text-brand-gold-300 font-display font-black text-sm tracking-widest leading-none">TEMPTATIONS</p>
              <p className="text-brand-gold-500/70 text-[10px] tracking-wider">Taste Of Happiness</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-brand-ivory-100/80 hover:text-brand-gold-300 text-sm font-medium transition-colors rounded-md hover:bg-brand-green-800"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/reservations"
              className="px-4 py-2 bg-brand-gold-500 text-brand-green-950 text-sm font-semibold rounded-lg hover:bg-brand-gold-400 transition-colors"
            >
              Reserve a Table
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-brand-ivory-50 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-green-900 border-t border-brand-gold-500/20 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 text-brand-ivory-100/80 hover:text-brand-gold-300 text-sm font-medium rounded-md hover:bg-brand-green-800"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/reservations"
            onClick={() => setOpen(false)}
            className="mt-2 px-4 py-3 bg-brand-gold-500 text-brand-green-950 text-sm font-semibold rounded-lg text-center"
          >
            Reserve a Table
          </Link>
        </div>
      )}
    </nav>
  );
}
