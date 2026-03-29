// apps/web/src/app/sitemap.ts
// Dynamic sitemap — crawlers index artists, venues, events, articles, beats
// Copilot wires: fetch all published entity slugs from API
// VS Code proves: /sitemap.xml returns valid XML with correct URLs
import { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://themusiciansindex.com';
  // Copilot: fetch slugs from API here
  const staticPages = [
    '/', '/features', '/how-it-works', '/for-artists',
    '/for-producers', '/for-venues', '/for-sponsors',
    '/press', '/partners', '/downloads', '/beats',
    '/discover', '/rankings', '/hall-of-fame',
  ].map(url => ({ url: base + url, changeFrequency: 'weekly' as const, priority: 0.8 }));
  return staticPages;
  // Copilot: add dynamic artist/venue/event/article slugs
}
