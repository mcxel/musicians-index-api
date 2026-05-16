import { Metadata } from "next";
import { SEO_BRAND } from "./SeoBrandConfig";

/**
 * MetaAuthorityEngine
 * Generates strict Google-ready Next.js metadata.
 */
export function generateTmiMetadata(pageTitle: string, description: string, path: string): Metadata {
  const fullTitle = `${pageTitle} | ${SEO_BRAND.PRODUCT_NAME} | ${SEO_BRAND.ROOT_ORGANIZATION}`;
  const canonicalUrl = `${SEO_BRAND.ROOT_CANONICAL}${path}`;

  return {
    title: fullTitle,
    description: description,
    keywords: SEO_BRAND.KEYWORDS.join(", "),
    authors: [{ name: SEO_BRAND.ROOT_ORGANIZATION, url: SEO_BRAND.ROOT_CANONICAL }],
    publisher: SEO_BRAND.ROOT_ORGANIZATION,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: description,
      url: canonicalUrl,
      siteName: SEO_BRAND.PRODUCT_NAME,
      locale: "en_US",
      type: "website",
      images: [{ url: `${SEO_BRAND.ROOT_CANONICAL}/assets/brand/bernoutglobal-og.jpg` }]
    }
  };
}