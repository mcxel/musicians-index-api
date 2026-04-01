import Link from 'next/link';

const STATS = [
  { label: 'Total Shows', value: '24', icon: '🎤' },
  { label: 'Artists Booked', value: '18', icon: '🎵' },
  { label: 'Pending Offers', value: '3', icon: '📨' },
  { label: 'Avg Score Match', value: '82', icon: '⭐' },
];

const RECENT_BOOKINGS = [
  { artist: 'DJ Kenzo', date: 'Jul 15', status: 'CONFIRMED', genre: 'Afrobeats', score: 91 },
  { artist: 'Amara Osei', date: 'Jul 22', status: 'PENDING', genre: 'R&B', score: 87 },
  { artist: 'Yusuf Bello', date: 'Aug 3', status: 'DECLINED', genre: 'Hip-Hop', score: 74 },
];

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  DECLINED: 'bg-red-500/20 text-red-400',
};

export default function VenueDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-[#ff6b35]">Venue Dashboard</h1>
        <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-semibold">
          VERIFIED VENUE
        </span>
      </div>
      <p className="text-gray-400 mb-8">Manage your bookings, discover artists, and track performance.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-[#ff6b35]">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/venues/dashboard/discovery"
          className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 hover:bg-[#ff6b35]/20 rounded-2xl p-5 transition-all group"
        >
          <p className="text-2xl mb-2">🔍</p>
          <h3 className="font-bold text-[#ff6b35] mb-1">Discover Artists</h3>
          <p className="text-xs text-gray-400">Get AI-powered artist recommendations for your next show.</p>
        </Link>
        <Link
          href="/venues/dashboard/offers"
          className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all"
        >
          <p className="text-2xl mb-2">📨</p>
          <h3 className="font-bold text-white mb-1">Manage Offers</h3>
          <p className="text-xs text-gray-400">View sent offers and track artist responses.</p>
        </Link>
        <Link
          href="/events"
          className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all"
        >
          <p className="text-2xl mb-2">📅</p>
          <h3 className="font-bold text-white mb-1">Schedule Event</h3>
          <p className="text-xs text-gray-400">Create and publish a new event at your venue.</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#ff6b35]">Recent Bookings</h2>
          <Link href="/venues/dashboard/offers" className="text-xs text-gray-400 hover:text-white transition-colors">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {RECENT_BOOKINGS.map((booking, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] text-xs font-bold">
                  {booking.artist.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{booking.artist}</p>
                  <p className="text-xs text-gray-400">{booking.genre} · {booking.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Score: <span className="text-white font-semibold">{booking.score}</span></span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
