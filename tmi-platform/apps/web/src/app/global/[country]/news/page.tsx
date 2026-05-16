/**
 * /global/[country]/news/page.tsx
 *
 * News and articles from a specific country
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News | Global Discovery | BernoutGlobal',
  description: 'Music news and articles from around the world',
};

export default function CountryNewsPage({
  params,
}: {
  params: { country: string };
}) {
  const countryCode = params.country.toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">
            📰 News from {countryCode}
          </h1>
          <p className="text-gray-400">Latest music news and articles</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <article
            key={i}
            className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-800" />
              <div className="flex-1">
                <div className="inline-block px-2 py-1 rounded text-xs bg-cyan-600/20 text-cyan-300 mb-2">
                  Breaking
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  Article Title {i}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  Latest news and updates about the music scene in {countryCode}. This is a featured article highlighting trending topics and artist news.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>2 hours ago</span>
                  <span className="text-cyan-400">Read more →</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
