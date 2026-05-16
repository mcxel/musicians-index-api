import type { Metadata } from "next";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { GoogleDiscoveryPromotionEngine } from "@/lib/promotion/GoogleDiscoveryPromotionEngine";
import { getHubCountries } from "@/lib/global/GlobalCountryRegistry";

export interface PromotionSeoPayload {
  metadata: Metadata;
  structuredData: Record<string, unknown>;
}

export function listPromotionSlugs(): string[] {
  const countrySlugs = getHubCountries().map((country) => `${country.countryCode.toLowerCase()}-live-music-tonight`);
  return [
    ...countrySlugs,
    "battle-of-the-bands-tonight",
    "hip-hop-cypher-live-today",
    "live-shows-happening-today",
  ];
}

export class PromotionSeoEngine {
  static build(slug: string): PromotionSeoPayload {
    const city = slug.split("-")[0] ? slug.split("-")[0].toUpperCase() : "Global";
    const discovery = GoogleDiscoveryPromotionEngine.buildLiveMusicTonight(city);
    const canonical = `${SEO_BRAND.ROOT_CANONICAL}/promotions/${slug}`;

    return {
      metadata: {
        title: discovery.title,
        description: discovery.description,
        alternates: { canonical },
        openGraph: {
          title: discovery.title,
          description: discovery.description,
          url: canonical,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: discovery.title,
          description: discovery.description,
          creator: SEO_BRAND.TWITTER_HANDLE,
        },
        keywords: discovery.keywords,
      },
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: discovery.title,
        description: discovery.description,
        url: canonical,
        publisher: {
          "@type": "Organization",
          name: SEO_BRAND.ROOT_ORGANIZATION,
        },
      },
    };
  }
}

export default PromotionSeoEngine;
