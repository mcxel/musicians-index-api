import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const publicAllowed = [
    '/',
    '/magazine',
    '/magazine/',
    '/articles/',
    '/news/',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
    '/disclosures',
    '/explore',
    '/shows',
    '/battles',
    '/rankings',
    '/trending',
    '/cities',
    '/genres',
    '/winners',
    '/events',
    '/billboards',
  ];

  const privateDisallowed = [
    '/api/',
    '/admin/',
    '/checkout/',
    '/billing/',
    '/hub/',
    '/auth/',
    '/onboarding/',
    '/dashboard/',
    '/settings/',
    '/account/',
    '/coming-soon/',
    '/launch-board/',
    '/investor-preview/',
    '/debug/',
    '/bots/',
    '/internal/',
  ];

  return {
    rules: [
      {
        userAgent: 'Mediapartners-Google',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      {
        userAgent: 'Googlebot',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      {
        userAgent: 'AdsBot-Google',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallowed,
      },
    ],
    sitemap: 'https://themusiciansindex.com/sitemap.xml',
  };
}
