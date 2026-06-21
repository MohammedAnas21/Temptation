import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy — Temptations Cafe",
  description: "Privacy policy for Temptations Cafe website and mobile applications.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Legal</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Privacy Policy</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-brand text-brand-green-900/80">
        <p className="text-sm text-brand-green-700/50 mb-8">Last updated: January 2025</p>

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly, including your name, phone number, email address, and order/reservation details. We also automatically collect device information, usage data, and location data when you use our services.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul>
            <li>Process your orders and reservations</li>
            <li>Send order confirmations, updates, and receipts via WhatsApp and push notifications</li>
            <li>Manage your loyalty account and reward points</li>
            <li>Send promotional offers and marketing communications (with your consent)</li>
            <li>Improve our services, menu, and customer experience</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </Section>

        <Section title="3. Data Sharing">
          <p>We do not sell your personal data. We share data only with:</p>
          <ul>
            <li><strong>Payment processors</strong> (PhonePe) to process your payments</li>
            <li><strong>WhatsApp Business API</strong> (Meta) to send order/reservation notifications</li>
            <li><strong>Firebase</strong> (Google) for authentication and push notifications</li>
            <li><strong>Cloud hosting providers</strong> to operate our platform</li>
          </ul>
        </Section>

        <Section title="4. Data Retention">
          <p>We retain your account data for as long as your account is active. Order and reservation records are kept for 3 years for tax and legal compliance. You may request deletion of your account by contacting us.</p>
        </Section>

        <Section title="5. Your Rights">
          <ul>
            <li>Access your personal data stored in your account</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications at any time</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </Section>

        <Section title="6. Security">
          <p>We use industry-standard encryption (TLS 1.3) for data in transit and AES-256 for data at rest. Payment data is processed by PCI-DSS compliant providers. We never store your full card details.</p>
        </Section>

        <Section title="7. Cookies & Tracking">
          <p>Our website uses essential cookies for functionality. We use analytics to understand usage patterns. You can control cookie preferences in your browser settings.</p>
        </Section>

        <Section title="8. Children&apos;s Privacy">
          <p>Our services are not directed at children under 13. We do not knowingly collect data from children. If you believe a child has provided us data, contact us for immediate deletion.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this policy periodically. We will notify you of significant changes via email or in-app notification. Continued use of our services constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>For privacy-related queries or data requests:</p>
          <p><strong>Email:</strong> hello@temptationscafe.in<br /><strong>Phone:</strong> +91 98765 43210<br /><strong>Address:</strong> Temptations Cafe, Kalaburagi, Karnataka, India</p>
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
