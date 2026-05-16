import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";

export interface ArtistKnowledgePanelPayload {
  slug: string;
  canonical: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  schema: Record<string, unknown>;
}

function formatNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export class ArtistKnowledgePanelEngine {
  static build(slug: string): ArtistKnowledgePanelPayload {
    const artist = ARTIST_SEED.find((entry) => entry.id === slug);
    const name = artist?.name ?? formatNameFromSlug(slug);
    const genre = artist?.genre ?? "Music";
    const city = "Global";
    const canonical = `${SEO_BRAND.ROOT_CANONICAL}/artists/${slug}`;

    const title = `${name} | Knowledge Panel | ${SEO_BRAND.PRODUCT_NAME}`;
    const description = `${name} is featured on ${SEO_BRAND.PRODUCT_NAME}. Discover music profile, genre, city presence, live events, and ranked content.`;

    return {
      slug,
      canonical,
      metadata: {
        title,
        description,
        keywords: [
          name,
          `${name} artist profile`,
          `${genre} artist`,
          `${city} musician`,
          "music knowledge panel",
          "BernoutGlobal",
          "The Musician's Index",
        ],
      },
      schema: {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        name,
        genre,
        url: canonical,
        foundingLocation: {
          "@type": "Place",
          name: city,
        },
        sameAs: [
          canonical,
          `${SEO_BRAND.ROOT_CANONICAL}/artists/${slug}/music`,
          `${SEO_BRAND.ROOT_CANONICAL}/artists/${slug}/campaigns`,
          `${SEO_BRAND.ROOT_CANONICAL}/artists/${slug}/press-kit`,
        ],
        mainEntityOfPage: canonical,
        publisher: {
          "@type": "Organization",
          name: SEO_BRAND.ROOT_ORGANIZATION,
          url: SEO_BRAND.ROOT_CANONICAL,
        },
      },
    };
  }

  static buildBatch(slugs: string[]): ArtistKnowledgePanelPayload[] {
    return slugs.map((slug) => this.build(slug));
  }
}

export default ArtistKnowledgePanelEngine;
