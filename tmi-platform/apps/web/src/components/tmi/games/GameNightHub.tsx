'use client';

import Link from 'next/link';

const GAMES = [
  {
    id: 'song-battle',
    title: 'Song Battle',
    desc: 'Head-to-head song vs. song voting arena. Cast your crown vote.',
    icon: '⚔️',
    status: 'live' as const,
    players: 412,
    prize: '$500 weekly prize',
    href: '/song-battle',
    color: '#FF2DAA',
  },
  {
    id: 'dirty-dozens',
    title: 'Dirty Dozens',
    desc: 'Rapid-fire lyrical challenges. 12 bars, 12 seconds.',
    icon: '🎤',
    status: 'live' as const,
    players: 289,
    prize: 'XP + Crown Points',
    href: '/dirty-dozens',
    color: '#AA2DFF',
  },
  {
    id: 'monthly-idol',
    title: 'Monthly Idol',
    desc: 'Month-long elimination to crown the platform champion.',
    icon: '👑',
    status: 'upcoming' as const,
    players: 1840,
    prize: '$2,000 + Season Pass',
    href: '/monthly-idol',
    color: '#FFD700',
  },
  {
    id: 'cypher-arena',
    title: 'Cypher Arena',
    desc: 'Open freestyle battle room. Round-based, crowd-judged.',
    icon: '🔥',
    status: 'live' as const,
    players: 167,
    prize: 'XP + Bragging Rights',
    href: '/games/cypher-arena',
    color: '#00FF88',
  },
  {
    id: 'name-that-tune',
    title: 'Name That Tune',
    desc: 'First to name the song wins the round.',
    icon: '🎵',
    status: 'upcoming' as const,
    players: 88,
    prize: 'XP + Fan Points',
    href: '/games/name-that-tune',
    color: '#00FFFF',
  },
  {
    id: 'deal-or-feud',
    title: 'Deal or Feud',
    desc: 'Genre-based trivia showdown. Fans vs. Artists.',
    icon: '🎲',
    status: 'upcoming' as const,
    players: 55,
    prize: 'XP + Sponsor Prizes',
    href: '/games/deal-or-feud',
    color: '#FF7700',
  },
  {
    id: 'dirty-dozens-open',
    title: 'Trivia Night',
    desc: 'Music knowledge head-to-head. Pick your genre.',
    icon: '❓',
    status: 'upcoming' as const,
    players: 44,
    prize: 'XP + Badges',
    href: '/games/trivia',
    color: '#AA2DFF',
  },
  {
    id: 'lyric-fill',
    title: 'Lyric Fill',
    desc: 'Complete the lyrics before the timer runs out.',
    icon: '📝',
    status: 'upcoming' as const,
    players: 230,
    prize: 'XP + Crown Points',
    href: '/games/lyric-fill',
    color: '#00FFFF',
  },
];

const STATUS_CFG = {
  live:     { label: '🔴 LIVE',     color: '#ef4444' },
  upcoming: { label: '⏳ UPCOMING', color: '#f59e0b' },
  ended:    { label: '✅ ENDED',    color: '#6b7280' },
};

export default function GameNightHub() {
  const live     = GAMES.filter((g) => g.status === 'live');
  const upcoming = GAMES.filter((g) => g.status === 'upcoming');

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80, fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '44px 24px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← HOME</Link>
          <Link href="/shows" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>SHOWS</Link>
        </div>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', color: '#FF2DAA', marginBottom: 6 }}>TMI GAME NIGHT</div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 900, margin: '0 0 8px' }}>Games & Challenges</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Compete, win prizes, earn XP. Live games running now.
          </p>
        </div>

        {/* Live now */}
        {live.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: '#ef4444', marginBottom: 14 }}>
              🔴 LIVE NOW
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {live.map((game) => {
                const sCfg = STATUS_CFG[game.status];
                return (
                  <Link key={game.id} href={game.href} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: `${game.color}0d`, border: `1px solid ${game.color}40`,
                        borderRadius: 14, padding: '20px',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span
                          style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
                            color: sCfg.color, background: `${sCfg.color}18`,
                            border: `1px solid ${sCfg.color}44`, borderRadius: 4, padding: '2px 8px',
                          }}
                        >
                          {sCfg.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{game.players.toLocaleString()} playing</span>
                      </div>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{game.icon}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 5 }}>{game.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 12, lineHeight: 1.4 }}>{game.desc}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: game.color, fontWeight: 700 }}>🏆 {game.prize}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: game.color }}>Join Now →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
              UPCOMING GAMES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {upcoming.map((game) => {
                const sCfg = STATUS_CFG[game.status];
                return (
                  <Link key={game.id} href={game.href} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12, padding: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 8, fontWeight: 800, letterSpacing: '0.12em',
                            color: sCfg.color, background: `${sCfg.color}15`,
                            border: `1px solid ${sCfg.color}35`, borderRadius: 4, padding: '2px 7px',
                          }}
                        >
                          {sCfg.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 22 }}>{game.icon}</span>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{game.title}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, lineHeight: 1.4 }}>{game.desc}</div>
                      <div style={{ fontSize: 10, color: game.color, fontWeight: 700 }}>🏆 {game.prize}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/battles" style={{ padding: '10px 20px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: '#FF2DAA', color: '#fff', textDecoration: 'none' }}>
            ⚔️ Battle Arena
          </Link>
          <Link href="/cypher" style={{ padding: '10px 20px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            🎤 Cypher Sessions
          </Link>
          <Link href="/leaderboard" style={{ padding: '10px 20px', borderRadius: 24, fontSize: 12, fontWeight: 800, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700', textDecoration: 'none' }}>
            👑 Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
