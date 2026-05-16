/**
 * /global/[country]/events/page.tsx
 *
 * Live events and battles in a specific country
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Global Discovery | BernoutGlobal',
  description: 'Live events and battles from around the world',
};

export default function CountryEventsPage({
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
            🎪 Events in {countryCode}
          </h1>
          <p className="text-gray-400">Live events, battles, and shows</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 transition-all"
            >
              <div className="bg-gray-800 h-32 rounded-lg mb-3" />
              <h3 className="font-semibold text-lg mb-1">Event {i}</h3>
              <p className="text-sm text-gray-400 mb-3">Live now • {Math.floor(Math.random() * 500) + 100} viewers</p>
              <button className="w-full py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors">
                Join Event
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
