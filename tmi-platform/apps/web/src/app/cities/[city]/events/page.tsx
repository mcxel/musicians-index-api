/**
 * /cities/[city]/events/page.tsx
 *
 * Events in a city
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'City Events | BernoutGlobal',
  description: 'Music events and shows',
};

export default function CityEventsPage({
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
            🎵 Events in {cityName}
          </h1>
          <p className="text-gray-400">Upcoming shows and battles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-fuchsia-500/50 transition-all">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-800" />
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">Event {i}</div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="inline-block mr-3">📅 June {i + 10}</span>
                  <span className="inline-block">⏰ 8:00 PM</span>
                </div>
                <div className="text-sm text-cyan-400">🎤 Hosted by Artist Name</div>
              </div>
              <button className="px-4 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-medium transition-colors self-center whitespace-nowrap">
                Get Ticket
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
