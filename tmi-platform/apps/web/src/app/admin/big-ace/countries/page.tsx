/**
 * /admin/big-ace/countries/page.tsx
 *
 * Country-level administration dashboard
 * Manage country parity, balance, and growth
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Countries Dashboard | Big Ace Admin | BernoutGlobal',
  description: 'Country management and parity tracking',
};

export default function CountriesAdminPage() {
  const countries = [
    { code: '🇺🇸 US', artists: 420, venues: 85, rooms: 14, users: 2400, status: 'optimal' },
    { code: '🇳🇬 NG', artists: 280, venues: 50, rooms: 9, users: 1800, status: 'optimal' },
    { code: '🇬🇧 GB', artists: 200, venues: 40, rooms: 7, users: 1200, status: 'healthy' },
    { code: '🇧🇷 BR', artists: 180, venues: 40, rooms: 6, users: 980, status: 'healthy' },
    { code: '🇰🇷 KR', artists: 150, venues: 30, rooms: 5, users: 850, status: 'growing' },
    { code: '🇯🇲 JM', artists: 120, venues: 30, rooms: 4, users: 650, status: 'growing' },
  ];

  const statusColors = {
    optimal: '#00FF88',
    healthy: '#00FFFF',
    growing: '#FFD700',
    needsHelp: '#FF2DAA',
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">🌐 Country Parity Management</h1>
          <p className="text-gray-400">Monitor and manage country-level balance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Parity Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">📊 Country Parity Index</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Fully Staffed', value: '8', desc: 'Countries with 8/8 features' },
              { label: 'Balanced', value: '4', desc: 'Countries with 6-7 features' },
              { label: 'Growing', value: '2', desc: 'Countries with 4-5 features' },
              { label: 'Launching', value: '0', desc: 'Countries with <4 features' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="text-3xl font-bold text-cyan-300 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Country Table */}
        <section>
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">🌍 Country Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Country</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Artists</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Venues</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Rooms</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Live Users</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr key={country.code} className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                    <td className="py-3 px-4 font-semibold">{country.code}</td>
                    <td className="py-3 px-4 text-gray-300">{country.artists}</td>
                    <td className="py-3 px-4 text-gray-300">{country.venues}</td>
                    <td className="py-3 px-4 text-gray-300">{country.rooms}</td>
                    <td className="py-3 px-4 text-gray-300">{country.users.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-block px-3 py-1 rounded text-xs font-semibold"
                        style={{
                          background: `${statusColors[country.status as keyof typeof statusColors]}20`,
                          color: statusColors[country.status as keyof typeof statusColors],
                        }}
                      >
                        {country.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Balance Actions */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">⚙️ Balance Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Promote Emerging Scenes', desc: 'Boost visibility for growing countries', icon: '📈' },
              { title: 'Balance Room Load', desc: 'Distribute users across regions', icon: '⚖️' },
              { title: 'Feature New Artists', desc: 'Showcase artists from underrepresented countries', icon: '⭐' },
              { title: 'Sponsor Events', desc: 'Organize growth initiatives', icon: '🎪' },
            ].map((action) => (
              <button
                key={action.title}
                className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all text-left group"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-bold group-hover:text-cyan-300 transition-colors mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.desc}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
