import Link from 'next/link';

const BOTS = [
  { id: '1', name: 'ArticleBot', role: 'Writes articles & interviews', status: 'RUNNING', lastRun: '5 min ago', jobsToday: 12, icon: '✍️' },
  { id: '2', name: 'SponsorBot', role: 'Finds & contacts sponsors', status: 'RUNNING', lastRun: '22 min ago', jobsToday: 4, icon: '💼' },
  { id: '3', name: 'ModerationBot', role: 'Moderates chat & comments', status: 'RUNNING', lastRun: '1 min ago', jobsToday: 87, icon: '🛡️' },
  { id: '4', name: 'AdBot', role: 'Sells & places ad slots', status: 'IDLE', lastRun: '2 hrs ago', jobsToday: 1, icon: '📢' },
  { id: '5', name: 'NotificationBot', role: 'Sends push & email alerts', status: 'RUNNING', lastRun: '3 min ago', jobsToday: 234, icon: '🔔' },
  { id: '6', name: 'RankingBot', role: 'Updates charts & leaderboards', status: 'RUNNING', lastRun: '15 min ago', jobsToday: 6, icon: '🏆' },
  { id: '7', name: 'ContestBot', role: 'Runs contests & picks winners', status: 'IDLE', lastRun: '1 day ago', jobsToday: 0, icon: '🎯' },
  { id: '8', name: 'BookingBot', role: 'Books venues & sends offers', status: 'RUNNING', lastRun: '8 min ago', jobsToday: 9, icon: '📅' },
  { id: '9', name: 'AnalyticsBot', role: 'Tracks stats & generates reports', status: 'RUNNING', lastRun: '30 min ago', jobsToday: 3, icon: '📊' },
  { id: '10', name: 'ReplayBot', role: 'Processes & archives replays', status: 'ERROR', lastRun: '4 hrs ago', jobsToday: 0, icon: '🎬' },
];

const STATUS_STYLES: Record<string, string> = {
  RUNNING: 'bg-green-500/20 text-green-400 border-green-500/30',
  IDLE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
  STOPPED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function AdminBotsPage() {
  const running = BOTS.filter((b) => b.status === 'RUNNING').length;
  const errors = BOTS.filter((b) => b.status === 'ERROR').length;
  const totalJobs = BOTS.reduce((sum, b) => sum + b.jobsToday, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Bot Management</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Bot Orchestration</h1>
      <p className="text-gray-400 mb-8">Monitor and control all platform automation bots.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Bots', value: BOTS.length, color: 'text-white' },
          { label: 'Running', value: running, color: 'text-green-400' },
          { label: 'Errors', value: errors, color: 'text-red-400' },
          { label: 'Jobs Today', value: totalJobs, color: 'text-[#ff6b35]' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BOTS.map((bot) => (
          <div
            key={bot.id}
            className={`bg-white/5 border rounded-2xl p-5 ${bot.status === 'ERROR' ? 'border-red-500/30' : 'border-white/10'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bot.icon}</span>
                <div>
                  <h3 className="font-bold text-sm">{bot.name}</h3>
                  <p className="text-xs text-gray-400">{bot.role}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[bot.status]}`}>
                {bot.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Last run: {bot.lastRun}</span>
              <span>{bot.jobsToday} jobs today</span>
            </div>
            <div className="flex gap-2">
              {bot.status === 'RUNNING' ? (
                <button className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors">
                  Stop
                </button>
              ) : (
                <button className="flex-1 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg transition-colors">
                  Start
                </button>
              )}
              <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold rounded-lg transition-colors">
                Logs
              </button>
              <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold rounded-lg transition-colors">
                Config
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
