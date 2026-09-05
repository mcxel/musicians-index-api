import type { MetadataRoute } from "next";
import SitemapAuthorityEngine from "@/lib/seo/SitemapAuthorityEngine";

export default function sitemap(): MetadataRoute.Sitemap {
  return SitemapAuthorityEngine.generateSitemap();
}
