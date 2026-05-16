import type { Metadata } from "next";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { getBillboardBySlug } from "@/lib/billboards/BillboardRegistry";
import { BillboardShareCardEngine } from "@/lib/billboards/BillboardShareCardEngine";

export interface BillboardSeoPayload {
  metadata: Metadata;
  structuredData: Record<string, unknown>;
}

export class BillboardSeoAuthorityEngine {
  static build(slug: string): BillboardSeoPayload | null {
    const billboard = getBillboardBySlug(slug);
    if (!billboard) return null;

    const country = getCountry(billboard.country);
    const shareCard = BillboardShareCardEngine.build(slug);
    const canonical = `${SEO_BRAND.ROOT_CANONICAL}/billboards/${slug}`;

    return {
      metadata: {
        title: billboard.seoTitle,
        description: billboard.seoDescription,
        alternates: { canonical },
        openGraph: {
          title: billboard.seoTitle,
          description: billboard.seoDescription,
          url: canonical,
          type: "article",
          siteName: "BernoutGlobal",
          images: shareCard ? [{ url: shareCard.image, alt: billboard.title }] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: billboard.seoTitle,
          description: billboard.seoDescription,
          images: shareCard ? [shareCard.image] : undefined,
          creator: SEO_BRAND.TWITTER_HANDLE,
        },
      },
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: billboard.title,
        description: billboard.seoDescription,
        url: canonical,
        datePublished: billboard.startDate,
        dateModified: billboard.endDate,
        publisher: {
          "@type": "Organization",
          name: SEO_BRAND.ROOT_ORGANIZATION,
        },
        about: {
          "@type": "MusicGroup",
          name: billboard.artistSlug,
          url: `${SEO_BRAND.ROOT_CANONICAL}/artists/${billboard.artistSlug}`,
        },
        contentLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressCountry: country?.name ?? billboard.country,
          },
        },
      },
    };
  }
}

export default BillboardSeoAuthorityEngine;
