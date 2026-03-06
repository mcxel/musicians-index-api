import { MetadataRoute } from 'next'

const baseUrl = "https://berntoutglobal.com";

// If some of these routes don't exist yet, you can still include them for future indexing.
// Or remove any you haven't created yet.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },

    // TMI Magazine core
    { url: `${baseUrl}/magazine`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/artists`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/live-rooms`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Products (ONLY your allowed list)
    { url: `${baseUrl}/law-bubble`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/stream-and-win-radio`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/thunder-world`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/hot-screens`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/mini-ace`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/willdoit`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/rent-a-charge`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/need-a-charge`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/danikas-law`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    // Names / labels / hubs
    { url: `${baseUrl}/berntout-perductions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/big-kazhdog`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/bjm-beats`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Optional: search landing page for alias spelling (still NOT Boardroom)
    { url: `${baseUrl}/berntout-productions`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
  ];
}