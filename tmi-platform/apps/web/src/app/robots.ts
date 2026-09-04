import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/checkout/',
        '/hub/',
        '/auth/',
        '/onboarding/',
        '/dashboard/',
        '/coming-soon/',
        '/launch-board/',
        '/investor-preview/',
        '/magazine/issues/',
        '/magazine/archive/',
        '/magazine/article/',
        '/magazine/articles/',
        '/magazine/news/',
        '/magazine/artist/',
        '/debug/',
        '/bots/',
        '/internal/',
      ],
    },
    sitemap: 'https://themusiciansindex.com/sitemap.xml',
  };
}
