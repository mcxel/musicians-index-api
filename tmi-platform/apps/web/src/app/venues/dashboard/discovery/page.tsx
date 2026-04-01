import Link from 'next/link';

const RECOMMENDATIONS = [
  {
    id: '1', name: 'DJ Kenzo', genres: ['Afrobeats', 'Dancehall'], distanceKm: 12, score: 94,
    tags: ['FRESH_PICK', 'UNDISCOVERED'], isFirstTime: true, breakdown: { distance: 23, genre: 20, availability: 14, budget: 13, exposure: 15, participation: 5, subscription: 4 },
  },
  {
    id: '2', name: 'Amara Osei', genres: ['R&B', 'Soul'], distanceKm: 28, score: 87,
    tags: ['RISING'], isFirstTime: true, breakdown: { distance: 20, genre: 18, availability: 13, budget: 12, exposure: 12, participation: 4, subscription: 5 },
  },
  {
    id: '3', name: 'Yusuf Bello', genres: ['Hip-Hop', 'Trap'], distanceKm: 45, score: 74,
    tags: ['HIGH_PARTICIPATION'], isFirstTime: false, breakdown: { distance: 16, genre: 16, availability: 10, budget: 10, exposure: 8, participation: 5, subscription: 5 },
  },
  {
    id: '4', name: 'Fatima Diallo', genres: ['Afrobeats', 'Afro-Pop'], distanceKm: 8, score: 71,
    tags: ['UNDISCOVERED'], isFirstTime: true, breakdown: { distance: 24, genre: 15, availability: 8, budget: 9, exposure: 10, participation: 3, subscription: 2 },
  },
];

const TAG_STYLES: Record<string, string> = {
  FRESH_PICK: 'bg-green-500/20 text-green-400 border-green-500/30',
  UNDISCOVERED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  RISING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  HIGH_PARTICIPATION: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  COOLDOWN_BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-1.5">
        <div className="bg-[#ff6b35] h-1.5 rounded-full" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-gray-400 w-6 text-right">{value}</span>
    </div>
  );
}

export default function VenueDiscoveryPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/venues/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Artist Discovery</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Artist Recommendations</h1>
      <p className="text-gray-400 mb-8">
        AI-powered recommendations based on distance, genre fit, availability, budget, and exposure balance.
      </p>

      {/* Score Legend */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-xs text-gray-400">
        <p className="font-semibold text-white mb-2">Scoring Formula</p>
        <p>Distance(25) + Genre(20) + Availability(15) + Budget(15) + Exposure Boost(15) + Participation(5) + Subscription(5) − Repeat Penalty(20) − Recent Booking(10)</p>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {RECOMMENDATIONS.map((rec, idx) => (
          <div key={rec.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#ff6b35]/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] font-bold text-lg">
                    {rec.name.charAt(0)}
                  </div>
                  <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0a0a0f] border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    #{idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white">{rec.name}</h3>
                  <p className="text-xs text-gray-400">{rec.genres.join(', ')} · {rec.distanceKm}km away</p>
                  <div className="flex gap-1 mt-1">
                    {rec.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_STYLES[tag] ?? ''}`}>
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                    {rec.isFirstTime && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/5 text-gray-400 border-white/10">
                        FIRST TIME
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#ff6b35]">{rec.score}</p>
                <p className="text-xs text-gray-500">/ 100</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <ScoreBar label="Distance" value={rec.breakdown.distance} max={25} />
              <ScoreBar label="Genre" value={rec.breakdown.genre} max={20} />
              <ScoreBar label="Availability" value={rec.breakdown.availability} max={15} />
              <ScoreBar label="Budget" value={rec.breakdown.budget} max={15} />
              <ScoreBar label="Exposure" value={rec.breakdown.exposure} max={15} />
              <ScoreBar label="Participation" value={rec.breakdown.participation} max={5} />
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white text-sm font-semibold rounded-lg transition-colors">
                Send Offer
              </button>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm rounded-lg transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
