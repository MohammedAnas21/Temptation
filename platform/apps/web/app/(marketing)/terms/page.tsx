import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions — Temptations Cafe",
  description: "Terms and conditions for using Temptations Cafe services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Legal</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Terms &amp; Conditions</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-brand text-brand-green-900/80">
        <p className="text-sm text-brand-green-700/50 mb-8">Last updated: January 2025</p>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using the Temptations Cafe website, mobile application, or any of our services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </Section>

        <Section title="2. Services">
          <p>Temptations Cafe provides an online platform for:</p>
          <ul>
            <li>Browsing our menu and placing food orders for dine-in or takeaway</li>
            <li>Making table reservations</li>
            <li>Earning and redeeming loyalty points</li>
            <li>Receiving promotional offers and updates</li>
          </ul>
        </Section>

        <Section title="3. Account Registration">
          <p>To place orders or make reservations, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        </Section>

        <Section title="4. Orders & Payments">
          <ul>
            <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
            <li>Orders are confirmed only upon successful payment processing</li>
            <li>We reserve the right to refuse or cancel any order</li>
            <li>Payment is processed securely through PhonePe. We do not store your card or UPI PIN details</li>
            <li>Refunds, if applicable, are processed within 5-7 business days</li>
          </ul>
        </Section>

        <Section title="5. Reservations">
          <ul>
            <li>Reservations require a nominal advance deposit (₹200) which is adjustable against your bill</li>
            <li>Cancellations must be made at least 2 hours before the reserved time for a full refund</li>
            <li>No-shows may result in forfeiture of the deposit</li>
            <li>We reserve the right to release reserved tables after a 15-minute grace period</li>
          </ul>
        </Section>

        <Section title="6. Loyalty Program">
          <ul>
            <li>Loyalty points are earned on qualifying orders and visits</li>
            <li>Points have no cash value and are non-transferable</li>
            <li>We reserve the right to modify point values, redemption rates, or discontinue the program with 30 days notice</li>
            <li>Fraudulent or abusive activity may result in forfeiture of all points and account suspension</li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property">
          <p>All content on our platform — including logos, text, images, menu designs, and code — is the property of Temptations Cafe and is protected by applicable intellectual property laws.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>Temptations Cafe shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific service giving rise to the claim.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Kalaburagi, Karnataka.</p>
        </Section>

        <Section title="10. Contact">
          <p>For questions about these terms:</p>
          <p><strong>Email:</strong> hello@temptationscafe.in<br /><strong>Phone:</strong> +91 98765 43210</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-black text-xl text-brand-green-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
