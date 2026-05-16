/**
 * /admin/big-ace/global/page.tsx
 *
 * Global administration dashboard
 * Monitor worldwide activity, trends, and statistics
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Dashboard | Big Ace Admin | BernoutGlobal',
  description: 'Global platform statistics and monitoring',
};

export default function GlobalAdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">🌍 Global Observatory</h1>
          <p className="text-gray-400">Platform-wide statistics and real-time monitoring</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Key Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Countries', value: '14+', change: '+2 this month', color: 'cyan' },
            { label: 'Artists', value: '2.5K', change: '+340 this month', color: 'fuchsia' },
            { label: 'Live Now', value: '2,847', change: 'Peak hour activity', color: 'yellow' },
            { label: 'Rooms', value: '1,200', change: '+89 this month', color: 'green' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="p-4 rounded-lg bg-gray-900/50 border border-gray-800"
            >
              <div className="text-3xl font-bold text-cyan-300 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
              <div className="text-xs text-gray-500">{metric.change}</div>
            </div>
          ))}
        </section>

        {/* Activity by Region */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">📊 Activity by Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { region: 'Africa', countries: 4, rooms: 320, users: 8400 },
              { region: 'Americas', countries: 3, rooms: 680, users: 18900 },
              { region: 'Europe', countries: 3, rooms: 420, users: 12400 },
              { region: 'Asia-Pacific', countries: 4, rooms: 280, users: 9200 },
            ].map((region) => (
              <div
                key={region.region}
                className="p-4 rounded-lg bg-gray-900/50 border border-gray-800"
              >
                <h3 className="font-bold text-lg mb-3">{region.region}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Countries:</span>
                    <span className="text-cyan-300 font-semibold">{region.countries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rooms:</span>
                    <span className="text-fuchsia-300 font-semibold">{region.rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Users:</span>
                    <span className="text-yellow-300 font-semibold">{region.users.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Performers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">🔥 Top Countries by Activity</h3>
            <div className="space-y-2">
              {['🇺🇸 United States', '🇳🇬 Nigeria', '🇬🇧 United Kingdom', '🇧🇷 Brazil', '🇰🇷 South Korea'].map((country, i) => (
                <div key={country} className="p-3 rounded-lg bg-gray-800/50 flex justify-between items-center">
                  <span>{country}</span>
                  <span className="text-cyan-400 font-bold">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">📈 Trending Genres</h3>
            <div className="space-y-2">
              {['Hip-Hop', 'Afrobeats', 'K-Pop', 'Reggaeton', 'Electronic'].map((genre, i) => (
                <div key={genre} className="p-3 rounded-lg bg-gray-800/50 flex justify-between items-center">
                  <span>{genre}</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
