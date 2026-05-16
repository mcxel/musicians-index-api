import type { Metadata } from "next";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { ArtistExposureEngine } from "@/lib/promotion/ArtistExposureEngine";
import { listArtistBillboards } from "@/lib/billboards/BillboardRegistry";

export interface ArtistSeoPayload {
  metadata: Metadata;
  personSchema: Record<string, unknown>;
  musicArtistSchema: Record<string, unknown>;
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

export class ArtistSeoAuthorityEngine {
  static build(slug: string): ArtistSeoPayload {
    const artist = ARTIST_SEED.find((item) => item.id === slug);
    const name = artist?.name ?? displayName(slug);
    const canonical = `${SEO_BRAND.ROOT_CANONICAL}/artists/${slug}`;
    const billboards = listArtistBillboards(slug).map((item) => `/billboards/${item.slug}`);
    const exposure = ArtistExposureEngine.buildGraph(slug);

    const metadata: Metadata = {
      title: `${name} | Artist Hub | ${SEO_BRAND.PRODUCT_NAME}`,
      description: `${name} on ${SEO_BRAND.PRODUCT_NAME} by ${SEO_BRAND.ROOT_ORGANIZATION}. Discover profile, articles, billboards, battles, venues, and tickets.`,
      alternates: { canonical },
      openGraph: {
        title: `${name} | Artist Hub`,
        description: `${name} promoted by BernoutGlobal on The Musician's Index.`,
        url: canonical,
        siteName: "BernoutGlobal",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | Artist Hub`,
        description: `${name} discovery profile on The Musician's Index.`,
        creator: SEO_BRAND.TWITTER_HANDLE,
      },
      keywords: [
        name,
        "artist profile",
        "music battles",
        "billboard promotion",
        "The Musician's Index",
        "BernoutGlobal",
      ],
    };

    return {
      metadata,
      personSchema: {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        url: canonical,
        worksFor: SEO_BRAND.ROOT_ORGANIZATION,
      },
      musicArtistSchema: {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        name,
        genre: artist?.genre ?? "Music",
        url: canonical,
        sameAs: exposure.musicLinks.map((link) => `${SEO_BRAND.ROOT_CANONICAL}${link}`),
      },
      breadcrumbSchema: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_BRAND.ROOT_CANONICAL },
          { "@type": "ListItem", position: 2, name: "Artists", item: `${SEO_BRAND.ROOT_CANONICAL}/artists` },
          { "@type": "ListItem", position: 3, name, item: canonical },
        ],
      },
      relatedArticles: exposure.articles,
      relatedBattles: exposure.battles,
      relatedVenues: exposure.venues,
      relatedBillboards: billboards,
    };
  }
}

export default ArtistSeoAuthorityEngine;
