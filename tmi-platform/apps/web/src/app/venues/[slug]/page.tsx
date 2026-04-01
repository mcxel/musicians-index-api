import Link from 'next/link';

export default function VenueProfilePage({ params }: { params: { slug: string } }) {
  const venueName = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <div className="h-48 bg-gradient-to-br from-[#ff6b35]/30 to-purple-900/30 relative">
        <div className="absolute inset-0 flex items-end px-8 pb-6">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#ff6b35]/20 border border-[#ff6b35]/30 flex items-center justify-center text-3xl">
              🎧
            </div>
            <div>
              <h1 className="text-2xl font-bold">{venueName}</h1>
              <p className="text-gray-400 text-sm">Club · Lagos, NG · 500 capacity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold text-[#ff6b35] mb-3">About</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {venueName} is one of the premier music venues on the TMI platform, hosting live shows,
                cypher battles, and artist showcases. Known for discovering underground talent and
                giving emerging artists their first major stage.
              </p>
            </div>

            {/* Upcoming Shows */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold text-[#ff6b35] mb-4">Upcoming Shows</h2>
              <div className="space-y-3">
                {[
                  { date: 'Jul 15', title: 'Afrobeats Night', artists: ['DJ Kenzo', 'Amara Osei'] },
                  { date: 'Jul 22', title: 'Hip-Hop Showcase', artists: ['Yusuf Bello'] },
                  { date: 'Aug 3', title: 'Open Mic Night', artists: ['Various Artists'] },
                ].map((show, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="text-center min-w-[48px]">
                      <p className="text-xs text-gray-500">{show.date.split(' ')[0]}</p>
                      <p className="text-lg font-bold text-[#ff6b35]">{show.date.split(' ')[1]}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{show.title}</p>
                      <p className="text-xs text-gray-400">{show.artists.join(', ')}</p>
                    </div>
                    <button className="ml-auto text-xs px-3 py-1.5 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 text-[#ff6b35] rounded-lg transition-colors">
                      Tickets
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-gray-300 mb-4">Venue Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span>Club</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capacity</span>
                  <span>500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span>Lagos, NG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timezone</span>
                  <span>WAT (UTC+1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Currency</span>
                  <span>NGN</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-gray-300 mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {['Afrobeats', 'Hip-Hop', 'Afro-Fusion'].map((g) => (
                  <span key={g} className="text-xs bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/20 px-2 py-1 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/venues/dashboard"
              className="block w-full text-center py-3 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Book This Venue
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
