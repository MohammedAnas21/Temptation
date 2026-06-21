import { Hero } from "@/components/sections/Hero";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import { DownloadApp } from "@/components/sections/DownloadApp";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Temptations Cafe — Kalaburagi's Premier Cafe & Restaurant",
  description: "Experience luxury dining at Temptations Cafe, Kalaburagi. Zinger Burgers, Cheese Burst Pizza, Special Mojitos, and more. Reserve your table online.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedMenu />
      <DownloadApp />
    </>
  );
}
