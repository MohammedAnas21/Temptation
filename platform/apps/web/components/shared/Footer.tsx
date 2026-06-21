import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-green-950 text-brand-ivory-100/70 border-t border-brand-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-brand-gold-300 font-display font-black text-lg tracking-widest mb-1">TEMPTATIONS</p>
            <p className="text-brand-gold-500/70 text-sm mb-4 italic">Taste Of Happiness</p>
            <p className="text-sm leading-relaxed">
              Kalaburagi's most beloved cafe. Luxury dining, legendary flavours, unforgettable experiences.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://instagram.com/temptationscafe" aria-label="Instagram"
                className="p-2 rounded-lg bg-brand-green-900 hover:bg-brand-gold-500 hover:text-brand-green-950 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com/temptationscafe" aria-label="Facebook"
                className="p-2 rounded-lg bg-brand-green-900 hover:bg-brand-gold-500 hover:text-brand-green-950 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-brand-gold-400 font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[["Menu", "/menu"], ["Reservations", "/reservations"], ["Events", "/events"],
                ["Offers", "/offers"], ["Gallery", "/gallery"], ["Blog", "/blog"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-gold-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-brand-gold-400 font-semibold text-sm tracking-wider uppercase mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              {[["About Us", "/about"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-gold-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-brand-gold-400 font-semibold text-sm tracking-wider uppercase mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 items-start">
                <MapPin size={15} className="text-brand-gold-500 mt-0.5 shrink-0" />
                <span>Kalaburagi, Karnataka, India</span>
              </li>
              <li className="flex gap-2 items-center">
                <Phone size={15} className="text-brand-gold-500 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-brand-gold-300">+91 98765 43210</a>
              </li>
              <li className="flex gap-2 items-center">
                <Mail size={15} className="text-brand-gold-500 shrink-0" />
                <a href="mailto:hello@temptationscafe.in" className="hover:text-brand-gold-300">hello@temptationscafe.in</a>
              </li>
            </ul>
            <div className="mt-5">
              <p className="text-xs text-brand-ivory-100/40 font-medium uppercase tracking-wider mb-2">Hours</p>
              <p className="text-sm">Mon–Sun: 10:00 AM – 11:00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-gold-500/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-ivory-100/40">
          <p>© {new Date().getFullYear()} Temptations Cafe. All rights reserved.</p>
          <p>Kalaburagi, Karnataka · CIN: pending</p>
        </div>
      </div>
    </footer>
  );
}
