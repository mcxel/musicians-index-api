import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Verified clean URL without angle brackets
  const baseUrl = 'https://themusiciansindex.com'; 
  
  return [
    {
      url: `${baseUrl}/home/1`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home/1-2`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/magazine`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/live/lobby`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Additional dynamic routes for /performers/[slug] and /articles/[slug] 
    // should be fetched from PerformerRegistry and appended here in a future pass.
  ];
}