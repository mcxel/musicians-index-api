import { SEO_BRAND } from "./SeoBrandConfig";

/**
 * SchemaAuthorityEngine
 * Outputs JSON-LD structured data for Google Crawlers.
 */

export function generateOrganizationSchema() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SEO_BRAND.ROOT_ORGANIZATION,
    "url": SEO_BRAND.ROOT_CANONICAL,
    "logo": `${SEO_BRAND.ROOT_CANONICAL}/assets/brand/bernoutglobal-logo.png`,
    "sameAs": [
      `https://twitter.com/${SEO_BRAND.TWITTER_HANDLE.replace('@', '')}`
    ],
    "brand": {
      "@type": "Brand",
      "name": SEO_BRAND.PRODUCT_NAME
    }
  });
}

export function generateArticleSchema(headline: string, authorName: string, datePublished: string, image: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": headline,
    "image": [image],
    "datePublished": datePublished,
    "author": [{
      "@type": "Person",
      "name": authorName
    }],
    "publisher": {
      "@type": "Organization",
      "name": SEO_BRAND.ROOT_ORGANIZATION,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_BRAND.ROOT_CANONICAL}/assets/brand/bernoutglobal-logo.png`
      }
    }
  });
}