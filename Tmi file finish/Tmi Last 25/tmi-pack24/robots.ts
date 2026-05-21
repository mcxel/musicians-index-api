// apps/web/src/app/robots.ts
// Robots.txt — tells crawlers what to index
import { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', '/dashboard/', '/backstage', '/green-room',
          '/soundcheck', '/arena', '/battle', '/cypher',
          '/api/', '/settings/', '/(auth)/',
        ],
      },
    ],
    sitemap: 'https://themusiciansindex.com/sitemap.xml',
  };
}
