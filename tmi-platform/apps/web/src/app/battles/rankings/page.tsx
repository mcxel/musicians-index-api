'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORY_LABELS, CATEGORY_ICONS, type CompetitionCategory, championshipYearlyEngine } from '@/lib/competition/ChampionshipYearlyEngine';

const FIGHT_CARD = [
  { id: 'astra-nova',   name: 'Astra Nova',    wins: 24, losses: 3,  streak: 7,  xp: 9820, prize: '$3,200', genre: 'Hip Hop',    rank: 1, tier: 'DIAMOND', color: '#00FFFF' },
  { id: 'crown-mic',    name: 'Crown Mic',     wins: 19, losses: 5,  streak: 4,  xp: 8940, prize: '$2,100', genre: 'Rap',        rank: 2, tier: 'GOLD',    color: '#FFD700' },
  { id: 'delta-flame',  name: 'Delta Flame',   wins: 16, losses: 7,  streak: 2,  xp: 8110, prize: '$1,400', genre: 'R&B',        rank: 3, tier: 'GOLD',    color: '#FF2DAA' },
  { id: 'neon-verse',   name: 'Neon Verse',    wins: 14, losses: 8,  streak: 0,  xp: 7650, prize: '$950',   genre: 'Hip Hop',    rank: 4, tier: 'SILVER',  color: '#AA2DFF' },
  { id: 'sable-court',  name: 'Sable Court',   wins: 12, losses: 6,  streak: 3,  xp: 7200, prize: '$820',   genre: 'Pop',        rank: 5, tier: 'SILVER',  color: '#00FF88' },
  { id: 'velox-prime',  name: 'Velox Prime',   wins: 11, losses: 9,  streak: 1,  xp: 6890, prize: '$640',   genre: 'Electronic', rank: 6, tier: 'SILVER',  color: '#FF6B35' },
  { id: 'wavetek',      name: 'Wavetek',        wins: 9,  losses: 4,  streak: 5,  xp: 6440, prize: '$580',   genre: 'Trap',       rank: 7, tier: 'SILVER',  color: '#FF2DAA' },
  { id: 'ivory-arc',    name: 'Ivory Arc',     wins: 8,  losses: 10, streak: 0,  xp: 5980, prize: '$340',   genre: 'Jazz',       rank: 8, tier: 'BRONZE',  color: '#00FFFF' },
  { id: 'torque-sin',   name: 'Torque Sin',    wins: 7,  losses: 8,  streak: 2,  xp: 5620, prize: '$280',   genre: 'Rock',       rank: 9, tier: 'BRONZE',  color: '#FFD700' },
  { id: 'koda-rush',    name: 'Koda Rush',     wins: 6,  losses: 9,  streak: 0,  xp: 5100, prize: '$190',   genre: 'Hip Hop',    rank: 10,tier: 'BRONZE',  color: '#AA2DFF' },
];

const CHAMPIONSHIP_DISPLAY: Array<{ category: CompetitionCategory; prize: string; period: string }> = [
  { category: 'rapper',            prize: '$2,500', period: '2026-W21' },
  { category: 'dancer',            prize: '$1,500', period: '2026-W21' },
  { category: 'singer',            prize: '$3,000', period: '2026-W21' },
  { category: 'dj',                prize: '$1,000', period: '2026-W21' },
  { category: 'battle-of-the-band',prize: '$5,000', period: '2026-05'  },
  { category: 'cypher-king',       prize: '$800',   period: '2026-05'  },
];

const TIER_COLORS: Record<string, string> = {
  DIAMOND: '#00FFFF', GOLD: '#FFD700', SILVER: '#aaa', BRONZE: '#cd7f32',
};

type Tab = 'fighters' | 'championships' | 'history';

export default function BattlesRankingsPage() {
  const [tab, setTab] = useState<Tab>('fighters');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.88)', borderBottom: '1px solid rgba(255,215,0,0.2)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800 }}>🏆 TMI BATTLE RANKINGS</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>Power Table · Season 2026</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/battles/live" style={{ fontSize: 10, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>LIVE BATTLES</Link>
          <Link href="/battles/create" style={{ fontSize: 10, color: '#00FF88', border: '1px solid rgba(0,255,136,0.4)', padding: '5px 14px', borderRadius: 6, textDecoration: 'none', fontWeight: 900, background: 'rgba(0,255,136,0.1)' }}>CHALLENGE →</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 0' }}>

        {/* Top 3 podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 10, marginBottom: 32, alignItems: 'end' }}>
          {/* 2nd */}
          <div style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.08), rgba(5,5,16,0.9))', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>2ND</div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🥈</div>
            <div style={{ fontSize: 14, fontWeight: 900 }}>{FIGHT_CARD[1]!.name}</div>
            <div style={{ fontSize: 10, color: '#FFD700', marginTop: 4, fontWeight: 700 }}>{FIGHT_CARD[1]!.wins}W · {FIGHT_CARD[1]!.losses}L</div>
            <div style={{ fontSize: 11, color: '#FFD700', marginTop: 6, fontWeight: 800 }}>{FIGHT_CARD[1]!.prize}</div>
          </div>
          {/* 1st */}
          <div style={{ background: 'linear-gradient(180deg, rgba(0,255,255,0.12), rgba(5,5,16,0.9))', border: '2px solid rgba(0,255,255,0.5)', borderRadius: 16, padding: '28px 20px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#00FFFF', color: '#000', fontSize: 9, fontWeight: 900, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.12em' }}>CHAMPION</div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#00FFFF', fontWeight: 800, marginBottom: 8, marginTop: 4 }}>1ST PLACE</div>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👑</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{FIGHT_CARD[0]!.name}</div>
            <div style={{ fontSize: 11, color: '#00FFFF', marginTop: 4, fontWeight: 700 }}>{FIGHT_CARD[0]!.wins}W · {FIGHT_CARD[0]!.losses}L · {FIGHT_CARD[0]!.streak} streak</div>
            <div style={{ fontSize: 13, color: '#00FFFF', marginTop: 6, fontWeight: 900 }}>{FIGHT_CARD[0]!.prize}</div>
          </div>
          {/* 3rd */}
          <div style={{ background: 'linear-gradient(180deg, rgba(255,45,170,0.08), rgba(5,5,16,0.9))', border: '1px solid rgba(255,45,170,0.25)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>3RD</div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🥉</div>
            <div style={{ fontSize: 14, fontWeight: 900 }}>{FIGHT_CARD[2]!.name}</div>
            <div style={{ fontSize: 10, color: '#FF2DAA', marginTop: 4, fontWeight: 700 }}>{FIGHT_CARD[2]!.wins}W · {FIGHT_CARD[2]!.losses}L</div>
            <div style={{ fontSize: 11, color: '#FF2DAA', marginTop: 6, fontWeight: 800 }}>{FIGHT_CARD[2]!.prize}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['fighters', 'championships', 'history'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 18px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', background: tab === t ? '#FFD700' : 'rgba(255,215,0,0.06)', color: tab === t ? '#000' : '#FFD700', border: `1px solid rgba(255,215,0,${tab === t ? '1' : '0.25'})`, borderRadius: 20, cursor: 'pointer', textTransform: 'uppercase' }}>
              {t}
            </button>
          ))}
        </div>

        {/* FIGHTERS tab */}
        {tab === 'fighters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FIGHT_CARD.map((fighter) => (
              <Link key={fighter.id} href={`/artists/${fighter.id}`} style={{ textDecoration: 'none', color: '#fff' }}
                onMouseEnter={() => setHoveredId(fighter.id)} onMouseLeave={() => setHoveredId(null)}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 16, alignItems: 'center', padding: '14px 20px', background: hoveredId === fighter.id ? `${fighter.color}0a` : 'rgba(255,255,255,0.02)', border: `1px solid ${hoveredId === fighter.id ? fighter.color + '35' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, transition: 'all 0.15s' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: fighter.rank <= 3 ? '#FFD700' : 'rgba(255,255,255,0.3)' }}>#{fighter.rank}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${fighter.color}20`, border: `2px solid ${fighter.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎤</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{fighter.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{fighter.genre} · {fighter.xp.toLocaleString()} XP</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: TIER_COLORS[fighter.tier] ?? '#aaa', border: `1px solid ${TIER_COLORS[fighter.tier] ?? '#aaa'}40`, padding: '2px 7px', borderRadius: 4 }}>{fighter.tier}</span>
                      {fighter.streak >= 3 && <span style={{ fontSize: 9, fontWeight: 800, color: '#FF6B35', background: 'rgba(255,107,53,0.15)', padding: '2px 7px', borderRadius: 4 }}>🔥 {fighter.streak} STREAK</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#00FF88' }}>{fighter.wins}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>WINS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#FF4444' }}>{fighter.losses}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>LOSSES</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#FFD700' }}>{fighter.prize}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>EARNED</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CHAMPIONSHIPS tab */}
        {tab === 'championships' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {CHAMPIONSHIP_DISPLAY.map(({ category, prize, period }) => {
              const board = championshipYearlyEngine.getLeaderboard(category, period);
              const leader = board.entries[0];
              const icon = CATEGORY_ICONS[category];
              const label = CATEGORY_LABELS[category];
              return (
                <Link key={category} href={`/championships/${category}`} style={{ textDecoration: 'none', color: '#fff' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 14, padding: '20px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{label}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#FFD700' }}>{prize}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>PRIZE POOL</div>
                      </div>
                    </div>
                    {leader ? (
                      <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 4 }}>LEADING</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD700' }}>{leader.artistName}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{leader.weightedVotes.toFixed(1)} weighted votes</div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        No votes yet · Vote to place first
                      </div>
                    )}
                    <div style={{ marginTop: 10, fontSize: 10, color: '#FF2DAA', fontWeight: 700 }}>VOTE NOW →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* HISTORY tab */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { title: 'MC Phantom wins "Cyber Rap Showdown"',     prize: '$500', method: 'vote',    margin: '68%', when: '2 days ago',  winner: 'MC Phantom',    color: '#AA2DFF' },
              { title: 'Sable Court wins "Pop Ballad Battle"',     prize: '$250', method: 'judges',  margin: '—',   when: '3 days ago',  winner: 'Sable Court',   color: '#FF2DAA' },
              { title: 'Astra Nova wins "Friday Night Freestyle"', prize: '$400', method: 'vote',    margin: '72%', when: '5 days ago',  winner: 'Astra Nova',    color: '#00FFFF' },
              { title: 'Crown Mic wins "Hip Hop Heritage"',        prize: '$300', method: 'vote',    margin: '61%', when: '6 days ago',  winner: 'Crown Mic',     color: '#FFD700' },
              { title: 'Velox Prime wins "EDM Drop Battle"',       prize: '$200', method: 'forfeit', margin: '—',   when: '1 week ago',  winner: 'Velox Prime',   color: '#00FF88' },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>👑</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{h.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{h.method.toUpperCase()} {h.margin !== '—' ? `· ${h.margin} vote` : ''} · {h.when}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: h.color }}>{h.prize}</div>
                  <Link href={`/artists/${h.winner.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Profile →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: 32, background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,45,170,0.06))', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 800, marginBottom: 6 }}>⚔️ CLIMB THE TABLE</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Win battles to earn XP, prize shares, and your belt.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/battles/live" style={{ padding: '11px 24px', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', borderRadius: 8, color: '#fff', fontWeight: 900, fontSize: 12, textDecoration: 'none' }}>ENTER ARENA</Link>
            <Link href="/battles/create" style={{ padding: '11px 20px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 8, color: '#FFD700', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>CHALLENGE NOW</Link>
          </div>
        </div>

      </div>
    </main>
  );
}
