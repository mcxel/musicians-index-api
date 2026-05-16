/**
 * /genres/[genre]/artists/page.tsx
 *
 * Artists in a specific genre
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Genre Artists | BernoutGlobal',
  description: 'Artists by genre',
};

export default function GenreArtistsPage({
  params,
}: {
  params: { genre: string };
}) {
  const genreName = params.genre.replace(/-/g, ' ').toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">
            🎤 {genreName} Artists
          </h1>
          <p className="text-gray-400">Top and trending artists</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-fuchsia-500/50 transition-all text-center group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-sm text-white">Artist {i}</div>
              <div className="text-xs text-gray-400 mt-1">{Math.floor(Math.random() * 100000) + 10000} followers</div>
              {Math.random() > 0.6 && <div className="text-xs text-cyan-400 mt-1">✓ Verified</div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
