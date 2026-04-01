import Link from 'next/link';

const OFFERS = [
  { id: '1', artist: 'DJ Kenzo', date: 'Jul 15, 2025', budget: '$800', status: 'PENDING', sentAt: '2 days ago', genre: 'Afrobeats' },
  { id: '2', artist: 'Amara Osei', date: 'Jul 22, 2025', budget: '$600', status: 'ACCEPTED', sentAt: '5 days ago', genre: 'R&B' },
  { id: '3', artist: 'Yusuf Bello', date: 'Aug 3, 2025', budget: '$500', status: 'DECLINED', sentAt: '1 week ago', genre: 'Hip-Hop' },
  { id: '4', artist: 'Fatima Diallo', date: 'Aug 10, 2025', budget: '$450', status: 'EXPIRED', sentAt: '2 weeks ago', genre: 'Afro-Pop' },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ACCEPTED: 'bg-green-500/20 text-green-400 border-green-500/30',
  DECLINED: 'bg-red-500/20 text-red-400 border-red-500/30',
  EXPIRED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function VenueOffersPage() {
  const pending = OFFERS.filter((o) => o.status === 'PENDING');
  const accepted = OFFERS.filter((o) => o.status === 'ACCEPTED');

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/venues/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Offers</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Booking Offers</h1>
      <p className="text-gray-400 mb-8">Track all offers sent to artists from your venue.</p>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pending', count: pending.length, color: 'text-yellow-400' },
          { label: 'Accepted', count: accepted.length, color: 'text-green-400' },
          { label: 'Declined', count: OFFERS.filter((o) => o.status === 'DECLINED').length, color: 'text-red-400' },
          { label: 'Total', count: OFFERS.length, color: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Offers List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-300">All Offers</h2>
          <Link
            href="/venues/dashboard/discovery"
            className="text-xs px-3 py-1.5 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white font-semibold rounded-lg transition-colors"
          >
            + New Offer
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {OFFERS.map((offer) => (
            <div key={offer.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] text-sm font-bold">
                  {offer.artist.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{offer.artist}</p>
                  <p className="text-xs text-gray-400">{offer.genre} · {offer.date} · {offer.budget}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 hidden sm:block">{offer.sentAt}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[offer.status]}`}>
                  {offer.status}
                </span>
                {offer.status === 'PENDING' && (
                  <button className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
