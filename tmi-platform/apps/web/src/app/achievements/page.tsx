const ACHIEVEMENTS = [
  { id: '1', title: 'First Show', description: 'Attended your first live show on TMI.', icon: '🎤', earned: true, earnedAt: 'Jan 2025', rarity: 'COMMON', points: 50 },
  { id: '2', title: 'Social Butterfly', description: 'Made 10 friends on the platform.', icon: '🦋', earned: true, earnedAt: 'Feb 2025', rarity: 'COMMON', points: 100 },
  { id: '3', title: 'Lobby Legend', description: 'Spent 10 hours in lobbies.', icon: '🏛️', earned: true, earnedAt: 'Mar 2025', rarity: 'RARE', points: 250 },
  { id: '4', title: 'Chart Climber', description: 'Voted on 50 songs in the Top 10.', icon: '📈', earned: false, earnedAt: null, rarity: 'RARE', points: 200 },
  { id: '5', title: 'Julius Whisperer', description: 'Unlocked 5 Julius variants.', icon: '🤖', earned: false, earnedAt: null, rarity: 'EPIC', points: 500 },
  { id: '6', title: 'VIP Access', description: 'Attended a VIP-only event.', icon: '💎', earned: false, earnedAt: null, rarity: 'LEGENDARY', points: 1000 },
  { id: '7', title: 'Cypher King', description: 'Won a Cypher battle.', icon: '👑', earned: false, earnedAt: null, rarity: 'EPIC', points: 750 },
  { id: '8', title: 'Early Adopter', description: 'Joined TMI in the first month.', icon: '🚀', earned: true, earnedAt: 'Jan 2025', rarity: 'LEGENDARY', points: 1000 },
];

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'text-gray-400 border-gray-600',
  RARE: 'text-blue-400 border-blue-600',
  EPIC: 'text-purple-400 border-purple-600',
  LEGENDARY: 'text-[#ff6b35] border-[#ff6b35]',
};

const RARITY_BG: Record<string, string> = {
  COMMON: 'bg-gray-500/10',
  RARE: 'bg-blue-500/10',
  EPIC: 'bg-purple-500/10',
  LEGENDARY: 'bg-[#ff6b35]/10',
};

export default function AchievementsPage() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned);
  const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Achievements</h1>
      <p className="text-gray-400 mb-8">Earn badges by participating in the TMI platform.</p>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#ff6b35]">{earned.length}</p>
          <p className="text-xs text-gray-400 mt-1">Earned</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{ACHIEVEMENTS.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Points</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>{earned.length}/{ACHIEVEMENTS.length} achievements</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-[#ff6b35] h-2 rounded-full transition-all"
            style={{ width: `${(earned.length / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative border rounded-2xl p-5 transition-all ${
              achievement.earned
                ? `${RARITY_BG[achievement.rarity]} ${RARITY_COLORS[achievement.rarity]}`
                : 'bg-white/3 border-white/5 opacity-50'
            }`}
          >
            {!achievement.earned && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[1px]">
                <span className="text-2xl">🔒</span>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-white">{achievement.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RARITY_COLORS[achievement.rarity]} ${RARITY_BG[achievement.rarity]}`}>
                    {achievement.rarity}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yellow-400 font-semibold">+{achievement.points} pts</span>
                  {achievement.earned && achievement.earnedAt && (
                    <span className="text-xs text-gray-500">Earned {achievement.earnedAt}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
