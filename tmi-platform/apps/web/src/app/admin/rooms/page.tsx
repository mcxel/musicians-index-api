import Link from 'next/link';

const ROOMS = [
  { id: '1', name: 'Afrobeats Theater', type: 'THEATER', status: 'LIVE', occupancy: 87, capacity: 120, host: 'DJ Kenzo', region: 'Lagos, NG', startedAt: '45 min ago' },
  { id: '2', name: 'Jakarta Hip-Hop Club', type: 'CLUB', status: 'LIVE', occupancy: 234, capacity: 300, host: 'Yusuf Bello', region: 'Jakarta, ID', startedAt: '1.5 hrs ago' },
  { id: '3', name: 'VIP Lounge NYC', type: 'VIP', status: 'LIVE', occupancy: 18, capacity: 25, host: 'Amara Osei', region: 'New York, US', startedAt: '20 min ago' },
  { id: '4', name: 'Global Cypher Arena', type: 'ARENA', status: 'SCHEDULED', occupancy: 0, capacity: 1000, host: 'FatimaDiallo', region: 'Online', startedAt: 'Starts in 2 hrs' },
  { id: '5', name: 'Cape Town Bar', type: 'BAR', status: 'IDLE', occupancy: 0, capacity: 80, host: null, region: 'Cape Town, ZA', startedAt: 'Last active 3 hrs ago' },
  { id: '6', name: 'Nairobi Open Mic', type: 'THEATER', status: 'ENDED', occupancy: 0, capacity: 60, host: 'Kwame Asante', region: 'Nairobi, KE', startedAt: 'Ended 1 hr ago' },
];

const TYPE_ICONS: Record<string, string> = {
  THEATER: '🎭',
  CLUB: '🎵',
  VIP: '⭐',
  ARENA: '🏟️',
  BAR: '🍺',
};

const STATUS_STYLES: Record<string, string> = {
  LIVE: 'bg-red-500/20 text-red-400 border-red-500/30',
  SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IDLE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ENDED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function AdminRoomsPage() {
  const liveRooms = ROOMS.filter((r) => r.status === 'LIVE');
  const totalOccupancy = liveRooms.reduce((s, r) => s + r.occupancy, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Rooms</span>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Room Management</h1>
          <p className="text-gray-400 mt-1">Monitor all live, scheduled, and idle rooms globally.</p>
        </div>
        <button className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white text-sm font-semibold rounded-xl transition-colors">
          + Create Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Rooms', value: ROOMS.length, color: 'text-white' },
          { label: 'Live Now', value: liveRooms.length, color: 'text-red-400' },
          { label: 'Live Audience', value: totalOccupancy, color: 'text-[#ff6b35]' },
          { label: 'Scheduled', value: ROOMS.filter((r) => r.status === 'SCHEDULED').length, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live Rooms — highlighted */}
      {liveRooms.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-red-400 text-sm mb-3">🔴 Live Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {liveRooms.map((room) => (
              <div key={room.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{TYPE_ICONS[room.type] ?? '🎵'}</span>
                  <div>
                    <h3 className="font-bold text-sm text-white">{room.name}</h3>
                    <p className="text-xs text-gray-400">{room.region}</p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{room.occupancy} / {room.capacity}</span>
                    <span>{Math.round((room.occupancy / room.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full">
                    <div
                      className="h-1.5 bg-red-400 rounded-full"
                      style={{ width: `${Math.round((room.occupancy / room.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">Host: {room.host} · {room.startedAt}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 rounded-lg transition-colors">
                    Monitor
                  </button>
                  <button className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 rounded-lg transition-colors">
                    End Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Rooms Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-sm text-gray-300">All Rooms</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-500">
                <th className="text-left px-6 py-3">Room</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Region</th>
                <th className="text-left px-4 py-3">Occupancy</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ROOMS.map((room) => (
                <tr key={room.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{TYPE_ICONS[room.type] ?? '🎵'}</span>
                      <div>
                        <p className="font-semibold text-white">{room.name}</p>
                        <p className="text-xs text-gray-400">{room.host ? `Host: ${room.host}` : 'No host'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{room.type}</td>
                  <td className="px-4 py-4 text-xs text-gray-300">{room.region}</td>
                  <td className="px-4 py-4 text-xs text-gray-300">
                    {room.occupancy}/{room.capacity}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[room.status]}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 rounded transition-colors">View</button>
                      <button className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 rounded transition-colors">End</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
