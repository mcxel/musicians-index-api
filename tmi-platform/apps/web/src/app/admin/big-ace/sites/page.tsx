// /admin/big-ace/sites: Cross-site travel and control command center
'use client';
import { useState } from 'react';

interface Site {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  users: number;
  rooms: number;
  revenue: number;
  uptime: number;
}

const sites: Site[] = [
  { id: 'bg', name: 'BernoutGlobal', status: 'online', users: 1200, rooms: 60, revenue: 4500, uptime: 99.9 },
  { id: 'tmi', name: 'The Musician\'s Index', status: 'online', users: 1100, rooms: 70, revenue: 5200, uptime: 99.8 },
  { id: 'xxl', name: 'XXL', status: 'online', users: 547, rooms: 26, revenue: 2750, uptime: 99.7 },
];

export default function BigAceSitesPage() {
  const [activeSite, setActiveSite] = useState<Site | null>(sites[0]);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sites Command</h1>
          <p className="text-green-400 font-mono text-sm">Cross-site travel & control</p>
        </div>

        {/* Site Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {sites.map(site => (
            <div
              key={site.id}
              onClick={() => setActiveSite(site)}
              className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                activeSite?.id === site.id
                  ? 'border-green-500 bg-gray-900'
                  : 'border-gray-700 bg-gray-950 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">{site.name}</h3>
                <div className={`w-3 h-3 rounded-full ${site.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-400 font-mono">{site.status.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Users</span>
                  <span className="text-white font-bold">{site.users}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms</span>
                  <span className="text-white font-bold">{site.rooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span className="text-yellow-400">${site.revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="text-green-400">{site.uptime}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Site Control Panel */}
        {activeSite && (
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{activeSite.name} Control Panel</h2>

            {/* Monitoring Section */}
            <div className="mb-8">
              <h3 className="text-green-400 font-mono text-sm mb-4">MONITOR</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-xs">Live Users</button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-xs">Rooms</button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-xs">Latency</button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-xs">Errors</button>
              </div>
            </div>

            {/* Control Actions */}
            <div className="mb-8">
              <h3 className="text-yellow-400 font-mono text-sm mb-4">ACTIONS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs font-bold">Travel To</button>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs font-bold">Switch Control</button>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs font-bold">Observe</button>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs font-bold">Broadcast</button>
              </div>
            </div>

            {/* Health Status */}
            <div className="bg-gray-800 rounded p-4 mb-8">
              <h3 className="text-white font-mono text-xs mb-4">SYSTEM HEALTH</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-300 w-24 text-xs">CPU</span>
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div className="bg-green-500 h-2 rounded" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-gray-300 ml-2 text-xs">45%</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-300 w-24 text-xs">Memory</span>
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div className="bg-yellow-500 h-2 rounded" style={{ width: '62%' }}></div>
                  </div>
                  <span className="text-gray-300 ml-2 text-xs">62%</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-300 w-24 text-xs">Connections</span>
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div className="bg-green-500 h-2 rounded" style={{ width: '38%' }}></div>
                  </div>
                  <span className="text-gray-300 ml-2 text-xs">38%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Button */}
        <a href="/admin/big-ace/overview" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-xs">← Back to Overview</a>
      </div>
    </div>
  );
}
