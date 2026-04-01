import Link from 'next/link';

const OFFERS = [
  { id: '1', venue: 'The Underground', city: 'Lagos, NG', date: 'Jul 15, 2025', budget: '$800', status: 'PENDING', receivedAt: '2 days ago', genre: 'Afrobeats', message: 'We love your sound and would love to have you headline our Afrobeats Night.' },
  { id: '2', venue: 'Blue Note NYC', city: 'New York, US', date: 'Aug 5, 2025', budget: '$1,200', status: 'PENDING', receivedAt: '1 day ago', genre: 'R&B', message: 'Interested in booking you for our summer series.' },
  { id: '3', venue: 'Cape Town Sessions', city: 'Cape Town, ZA', date: 'Jun 20, 2025', budget: '$400', status: 'ACCEPTED', receivedAt: '2 weeks ago', genre: 'Afrobeats', message: null },
  { id: '4', venue: 'Nairobi Rooftop', city: 'Nairobi, KE', date: 'May 10, 2025', budget: '$350', status: 'DECLINED', receivedAt: '1 month ago', genre: 'Afrobeats', message: null },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ACCEPTED: 'bg-green-500/20 text-green-400 border-green-500/30',
  DECLINED: 'bg-red-500/20 text-red-400 border-red-500/30',
  EXPIRED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function ArtistBookingsPage() {
  const pending = OFFERS.filter((o) => o.status === 'PENDING');

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/artist" className="text-gray-400 hover:text-white text-sm transition-colors">← Artist Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Booking Offers</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Booking Offers</h1>
      <p className="text-gray-400 mb-8">Venues are interested in booking you. Review and respond to offers.</p>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pending', count: pending.length, color: 'text-yellow-400' },
          { label: 'Accepted', count: OFFERS.filter((o) => o.status === 'ACCEPTED').length, color: 'text-green-400' },
          { label: 'Declined', count: OFFERS.filter((o) => o.status === 'DECLINED').length, color: 'text-red-400' },
          { label: 'Total', count: OFFERS.length, color: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Offers — highlighted */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-yellow-400 text-sm mb-3">⏳ Awaiting Your Response</h2>
          <div className="space-y-4">
            {pending.map((offer) => (
              <div key={offer.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">{offer.venue}</h3>
                    <p className="text-xs text-gray-400">{offer.city} · {offer.date} · {offer.budget}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[offer.status]}`}>
                    {offer.status}
                  </span>
                </div>
                {offer.message && (
                  <p className="text-sm text-gray-300 italic mb-4 border-l-2 border-yellow-500/30 pl-3">
                    &ldquo;{offer.message}&rdquo;
                  </p>
                )}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-sm font-semibold rounded-lg transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Offers */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-sm text-gray-300">All Offers</h2>
        </div>
        <div className="divide-y divide-white/5">
          {OFFERS.filter((o) => o.status !== 'PENDING').map((offer) => (
            <div key={offer.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{offer.venue}</p>
                <p className="text-xs text-gray-400">{offer.city} · {offer.date} · {offer.budget}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[offer.status]}`}>
                {offer.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
