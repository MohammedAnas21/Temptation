import type { Metadata } from "next";

const SITE_NAME = "Temptations Cafe";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://temptationscafe.in";
const DEFAULT_DESCRIPTION =
  "Temptations Cafe — Kalaburagi's most beloved cafe. Luxury dining, legendary flavours, unforgettable experiences.";

export function buildMetadata(overrides: Partial<Metadata> & {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}): Metadata {
  const title = overrides.title ? `${overrides.title} | ${SITE_NAME}` : SITE_NAME;
  const description = overrides.description ?? DEFAULT_DESCRIPTION;
  const image = overrides.image ?? `${SITE_URL}/og-default.jpg`;
  const url = `${SITE_URL}${overrides.path ?? ""}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
    ...overrides,
  };
}

export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Temptations Cafe",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    telephone: "+919876543210",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kalaburagi",
      addressLocality: "Kalaburagi",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.3297,
      longitude: 76.8206,
    },
    servesCuisine: ["Indian", "Continental", "Cafe"],
    priceRange: "₹₹",
    hasMenu: `${SITE_URL}/menu`,
    acceptsReservations: true,
    image: `${SITE_URL}/og-default.jpg`,
  };
}

export function menuItemSchema(item: { name: string; description?: string; price: number; image_url?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: item.name,
    description: item.description,
    offers: { "@type": "Offer", price: item.price, priceCurrency: "INR" },
    image: item.image_url,
  };
}
