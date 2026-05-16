import type { Metadata } from "next";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { ArtistExposureEngine } from "@/lib/promotion/ArtistExposureEngine";

export interface PerformerSeoPayload {
  metadata: Metadata;
  personSchema: Record<string, unknown>;
  breadcrumbSchema: Record<string, unknown>;
  relatedArticles: string[];
  relatedBattles: string[];
  relatedVenues: string[];
  relatedBillboards: string[];
}

function displayName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export class PerformerSeoAuthorityEngine {
  static build(slug: string): PerformerSeoPayload {
    const name = displayName(slug);
    const canonical = `${SEO_BRAND.ROOT_CANONICAL}/performers/${slug}`;
    const exposure = ArtistExposureEngine.buildGraph(slug);

    const metadata: Metadata = {
      title: `${name} | Performer Profile | ${SEO_BRAND.PRODUCT_NAME}`,
      description: `${name} performer page on The Musician's Index by BernoutGlobal with related articles, battles, venues, and billboards.`,
      alternates: { canonical },
      openGraph: {
        title: `${name} | Performer Profile`,
        description: `${name} promoted across The Musician's Index discovery network.`,
        url: canonical,
        type: "profile",
        siteName: "BernoutGlobal",
      },
      twitter: {
        card: "summary",
        title: `${name} | Performer Profile`,
        description: `${name} on The Musician's Index.`,
        creator: SEO_BRAND.TWITTER_HANDLE,
      },
    };

    return {
      metadata,
      personSchema: {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        url: canonical,
      },
      breadcrumbSchema: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_BRAND.ROOT_CANONICAL },
          { "@type": "ListItem", position: 2, name: "Performers", item: `${SEO_BRAND.ROOT_CANONICAL}/performers` },
          { "@type": "ListItem", position: 3, name, item: canonical },
        ],
      },
      relatedArticles: exposure.articles,
      relatedBattles: exposure.battles,
      relatedVenues: exposure.venues,
      relatedBillboards: exposure.billboards,
    };
  }
}

export default PerformerSeoAuthorityEngine;
