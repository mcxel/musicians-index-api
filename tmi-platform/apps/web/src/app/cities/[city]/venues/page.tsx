/**
 * /cities/[city]/venues/page.tsx
 *
 * Venues in a city
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'City Venues | BernoutGlobal',
  description: 'Music venues and concert halls',
};

export default function CityVenuesPage({
  params,
}: {
  params: { city: string };
}) {
  const cityName = params.city.replace(/-/g, ' ').toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">
            🎪 Venues in {cityName}
          </h1>
          <p className="text-gray-400">Music venues and concert halls</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 transition-all"
            >
              <div className="bg-gray-800 h-40 rounded-lg mb-4" />
              <h3 className="text-lg font-bold mb-2">Venue {i}</h3>
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div>📍 Address in {cityName}</div>
                <div>🎵 Capacity: {Math.floor(Math.random() * 1000) + 500} people</div>
                <div>🎸 Hip-Hop, Reggae, Indie</div>
              </div>
              <button className="w-full py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors">
                View Events
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
