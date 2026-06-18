import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Hide admin panels, API boundaries, and checkout from indexing
      disallow: ['/api/', '/admin/', '/checkout/'],
    },
    sitemap: 'https://themusiciansindex.com/sitemap.xml',
  };
}