import Link from 'next/link';

const MOCK_VENUES = [
  { id: '1', slug: 'the-underground', name: 'The Underground', type: 'CLUB', city: 'Lagos', country: 'NG', capacity: 500, verified: true, genres: ['Afrobeats', 'Hip-Hop'] },
  { id: '2', slug: 'jakarta-arena', name: 'Jakarta Arena', type: 'ARENA', city: 'Jakarta', country: 'ID', capacity: 5000, verified: true, genres: ['Pop', 'R&B', 'EDM'] },
  { id: '3', slug: 'blue-note-nyc', name: 'Blue Note NYC', type: 'THEATER', city: 'New York', country: 'US', capacity: 300, verified: true, genres: ['Jazz', 'Soul', 'R&B'] },
  { id: '4', slug: 'cape-town-sessions', name: 'Cape Town Sessions', type: 'BAR', city: 'Cape Town', country: 'ZA', capacity: 150, verified: false, genres: ['Afrobeats', 'Kwaito'] },
  { id: '5', slug: 'london-electric', name: 'London Electric', type: 'CLUB', city: 'London', country: 'GB', capacity: 800, verified: true, genres: ['Grime', 'UK Drill', 'Garage'] },
  { id: '6', slug: 'nairobi-rooftop', name: 'Nairobi Rooftop', type: 'FESTIVAL', city: 'Nairobi', country: 'KE', capacity: 2000, verified: false, genres: ['Afrobeats', 'Bongo Flava'] },
];

const TYPE_ICONS: Record<string, string> = {
  CLUB: '🎧',
  ARENA: '🏟️',
  THEATER: '🎭',
  BAR: '🍺',
  FESTIVAL: '🎪',
  ONLINE: '💻',
};

export default function VenuesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-[#ff6b35]">Venues</h1>
        <Link
          href="/venues/dashboard"
          className="text-sm px-4 py-2 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white font-semibold rounded-lg transition-colors"
        >
          Venue Dashboard
        </Link>
      </div>
      <p className="text-gray-400 mb-8">Discover venues booking artists globally.</p>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['All', 'Club', 'Arena', 'Theater', 'Bar', 'Festival', 'Online'].map((type) => (
          <button
            key={type}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
              type === 'All'
                ? 'bg-[#ff6b35] border-[#ff6b35] text-white'
                : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Venue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_VENUES.map((venue) => (
          <Link
            key={venue.id}
            href={`/venues/${venue.slug}`}
            className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#ff6b35]/40 transition-all hover:bg-white/8"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{TYPE_ICONS[venue.type] ?? '🏢'}</span>
              {venue.verified && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                  VERIFIED
                </span>
              )}
            </div>
            <h3 className="font-bold text-white group-hover:text-[#ff6b35] transition-colors mb-1">
              {venue.name}
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              {venue.city}, {venue.country} · {venue.type} · {venue.capacity.toLocaleString()} cap
            </p>
            <div className="flex flex-wrap gap-1">
              {venue.genres.map((g) => (
                <span key={g} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-400">
                  {g}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
