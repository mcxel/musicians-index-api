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
            { label: 'Countries', value: 'Loading', change: 'Real-time', color: 'cyan' },
            { label: 'Artists', value: 'Loading', change: 'Real-time', color: 'fuchsia' },
            { label: 'Live Now', value: 'Loading', change: 'Real-time', color: 'yellow' },
            { label: 'Rooms', value: 'Loading', change: 'Real-time', color: 'green' },
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
          <div style={{ padding: '40px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            <div style={{ marginBottom: 8 }}>Real-time regional activity data will be populated from the API.</div>
            <div style={{ fontSize: 11 }}>Global statistics are fetched from /api/admin/global in production.</div>
          </div>
        </section>

        {/* Top Performers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">🔥 Top Countries by Activity</h3>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              Ranking data from real platform activity will appear here.
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">📈 Trending Genres</h3>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              Genre trends will be calculated from real XP data.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
