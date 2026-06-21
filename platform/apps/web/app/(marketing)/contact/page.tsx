import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us — Temptations Cafe",
  description: "Get in touch with Temptations Cafe, Kalaburagi. Call, email or visit us for reservations and enquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Get In Touch</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Contact Us</h1>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <ContactItem icon={<MapPin size={20} />} label="Address" value="Kalaburagi, Karnataka, India" />
          <ContactItem icon={<Phone size={20} />} label="Phone" value="+91 98765 43210" href="tel:+919876543210" />
          <ContactItem icon={<Mail size={20} />} label="Email" value="hello@temptationscafe.in" href="mailto:hello@temptationscafe.in" />
          <ContactItem icon={<Clock size={20} />} label="Hours" value="Mon–Sun: 10:00 AM – 11:00 PM" />
        </div>
        <ContactForm />
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-brand-gold-500 mt-0.5">{icon}</div>
      <div>
        <p className="text-brand-gold-600 text-xs uppercase tracking-wider font-medium">{label}</p>
        {href ? (
          <a href={href} className="text-brand-green-900 font-medium hover:text-brand-gold-600 transition-colors">{value}</a>
        ) : (
          <p className="text-brand-green-900 font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
