import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { buildMetadata, restaurantSchema } from "@/lib/seo";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = buildMetadata({
  path: "/",
  image: "/og-default.jpg",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema()) }}
        />
      </head>
      <body className="bg-brand-ivory-50 text-brand-green-950 antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-brand-gold-500 focus:text-brand-green-950 focus:rounded-lg focus:font-semibold">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
