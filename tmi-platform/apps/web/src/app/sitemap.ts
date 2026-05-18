import { MetadataRoute } from 'next';

const base = 'https://themusiciansindex.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    // Homepage — highest authority
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },

    // Magazine surfaces — primary editorial content
    { url: `${base}/home/1`,          lastModified: now, changeFrequency: 'daily',  priority: 0.95 },
    { url: `${base}/home/2`,          lastModified: now, changeFrequency: 'daily',  priority: 0.90 },
    { url: `${base}/home/3`,          lastModified: now, changeFrequency: 'daily',  priority: 0.90 },
    { url: `${base}/home/4`,          lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/home/5`,          lastModified: now, changeFrequency: 'daily',  priority: 0.85 },
    { url: `${base}/home/magazine`,   lastModified: now, changeFrequency: 'daily',  priority: 0.88 },

    // Billboard & rankings
    { url: `${base}/magazine/billboards`, lastModified: now, changeFrequency: 'daily',  priority: 0.85 },
    { url: `${base}/rankings/crown`,      lastModified: now, changeFrequency: 'daily',  priority: 0.82 },
    { url: `${base}/winners`,             lastModified: now, changeFrequency: 'daily',  priority: 0.80 },

    // Platform entry points
    { url: `${base}/auth`,      lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/rooms/world-concert`, lastModified: now, changeFrequency: 'daily', priority: 0.78 },

    // Content sections
    { url: `${base}/articles`,  lastModified: now, changeFrequency: 'daily',   priority: 0.80 },
    { url: `${base}/artists`,   lastModified: now, changeFrequency: 'daily',   priority: 0.78 },
    { url: `${base}/venues`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.72 },

    // Platform info
    { url: `${base}/about`,          lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
    { url: `${base}/music-platform`, lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
    { url: `${base}/discover`,      lastModified: now, changeFrequency: 'daily',   priority: 0.75 },
  ];

  return core;
}
