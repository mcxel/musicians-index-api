import Link from 'next/link';

const EVENTS = [
  { id: '1', title: 'Afrobeats Night Lagos', venue: 'The Underground', date: 'Jul 15, 2025', type: 'LOCAL', status: 'PUBLISHED', tickets: 120, sold: 87, revenue: '$2,610' },
  { id: '2', title: 'Jakarta Hip-Hop Summit', venue: 'Jakarta Arena', date: 'Aug 3, 2025', type: 'REGIONAL', status: 'PUBLISHED', tickets: 500, sold: 312, revenue: '$9,360' },
  { id: '3', title: 'Global Cypher Online', venue: 'Online', date: 'Jul 28, 2025', type: 'ONLINE', status: 'PUBLISHED', tickets: 999, sold: 654, revenue: '$6,540' },
  { id: '4', title: 'Cape Town Open Mic', venue: 'Cape Town Sessions', date: 'Aug 20, 2025', type: 'LOCAL', status: 'DRAFT', tickets: 80, sold: 0, revenue: '$0' },
  { id: '5', title: 'NYC R&B Showcase', venue: 'Blue Note NYC', date: 'Sep 5, 2025', type: 'REGIONAL', status: 'CANCELLED', tickets: 200, sold: 45, revenue: '$1,350' },
];

const TYPE_COLORS: Record<string, string> = {
  LOCAL: 'text-blue-400',
  REGIONAL: 'text-purple-400',
  INTERNATIONAL: 'text-yellow-400',
  ONLINE: 'text-green-400',
  LIVESTREAM: 'text-cyan-400',
};

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-green-500/20 text-green-400 border-green-500/30',
  DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function AdminEventsPage() {
  const totalRevenue = '$19,860';
  const totalSold = EVENTS.reduce((s, e) => s + e.sold, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Events</span>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Event Management</h1>
          <p className="text-gray-400 mt-1">Manage all platform events globally.</p>
        </div>
        <button className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white text-sm font-semibold rounded-xl transition-colors">
          + Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Events', value: EVENTS.length, color: 'text-white' },
          { label: 'Published', value: EVENTS.filter((e) => e.status === 'PUBLISHED').length, color: 'text-green-400' },
          { label: 'Tickets Sold', value: totalSold, color: 'text-[#ff6b35]' },
          { label: 'Total Revenue', value: totalRevenue, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Events Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-sm text-gray-300">All Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-500">
                <th className="text-left px-6 py-3">Event</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Tickets</th>
                <th className="text-left px-4 py-3">Revenue</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {EVENTS.map((event) => (
                <tr key={event.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-xs text-gray-400">{event.venue}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold ${TYPE_COLORS[event.type] ?? 'text-gray-400'}`}>{event.type}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-300">{event.date}</td>
                  <td className="px-4 py-4 text-xs text-gray-300">
                    {event.sold}/{event.tickets}
                    <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                      <div
                        className="h-1 bg-[#ff6b35] rounded-full"
                        style={{ width: `${Math.round((event.sold / event.tickets) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-green-400 font-semibold">{event.revenue}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[event.status]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 rounded transition-colors">Edit</button>
                      <button className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 rounded transition-colors">Del</button>
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
