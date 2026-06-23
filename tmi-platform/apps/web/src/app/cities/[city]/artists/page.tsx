/**
 * /cities/[city]/artists/page.tsx
 *
 * Local artists in a city — reads from PerformerRegistry (Rule 8: Registry First)
 * No fake follower counts or random verified badges (Rule 20).
 */

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';

export const metadata: Metadata = {
  title: 'City Artists | The Musician\'s Index',
  description: 'Local artists and musicians on TMI',
};

export default function CityArtistsPage({
  params,
}: {
  params: { city: string };
}) {
  const citySlug = params.city;
  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Filter performers by city (case-insensitive partial match)
  const cityPerformers = PERFORMER_REGISTRY.filter(
    (p) => p.city.toLowerCase().includes(citySlug.replace(/-/g, ' ').toLowerCase())
  );

  // If no performers match this city, show top performers as discovery content
  const performers = cityPerformers.length > 0 ? cityPerformers : PERFORMER_REGISTRY.slice(0, 12);
  const showingAll = cityPerformers.length === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">
            🎤 Artists in {cityName}
          </h1>
          <p className="text-gray-400">
            {showingAll
              ? `No artists listed in ${cityName} yet. Showing all TMI performers.`
              : `${cityPerformers.length} performer${cityPerformers.length !== 1 ? 's' : ''} from ${cityName}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {performers.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-gray-400 text-lg mb-6">No artists in {cityName} yet.</p>
            <Link href="/performers" className="text-cyan-400 underline">Browse all performers →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {performers.map((performer) => (
              <Link
                key={performer.id}
                href={`/performers/${performer.slug}`}
                className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-fuchsia-500/50 transition-all text-center group cursor-pointer no-underline"
              >
                {performer.profileImageUrl ? (
                  <img
                    src={performer.profileImageUrl}
                    alt={performer.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-fuchsia-600 mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                    {(performer.name ?? '?').charAt(0)}
                  </div>
                )}
                <div className="font-semibold text-sm text-white">{performer.name}</div>
                <div className="text-xs text-gray-400 mt-1">{performer.category}</div>
                {performer.isLive && (
                  <div className="text-xs text-red-400 mt-1 font-bold">🔴 LIVE NOW</div>
                )}
                {performer.tier === 'Diamond' || performer.tier === 'Platinum' ? (
                  <div className="text-xs text-cyan-400 mt-1">✓ Verified</div>
                ) : null}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/performers" className="text-cyan-400 text-sm underline">
            Browse all performers on TMI →
          </Link>
        </div>
      </div>
    </main>
  );
}
