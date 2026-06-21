import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://temptationscafe.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: SITE_URL, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/menu`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/reservations`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/events`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/offers`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/gallery`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/about`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/contact`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/blog`, priority: 0.7, changeFrequency: "weekly" as const },
  ];

  return staticPages.map(({ url, priority, changeFrequency }) => ({
    url,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
