'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Module types ────────────────────────────────────────────────────────────

interface MerchItem {
  id: string;
  name: string;
  type: 'shirt' | 'hoodie' | 'nft' | 'beat' | 'ticket';
  price: string;
  emoji: string;
}

interface MediaClip {
  id: string;
  title: string;
  type: 'clip' | 'audio';
  duration: string;
  views: number;
}

interface BattleEntry {
  id: string;
  opponent: string;
  outcome: 'win' | 'loss';
  votesPct: number;
  category: string;
}

interface SponsorSlot {
  id: string;
  brand: string;
  label: string;
  color: string;
}

export interface PerformerCanvasData {
  displayName: string;
  slug: string;
  tagline: string;
  genre: string;
  rank: number;
  xp: number;
  crownProgress: number; // 0–100
  tippingHeat: number;   // 0–100
  battleRecord: { wins: number; losses: number };
  bio: string;
  heroImage?: string;
  accentColor: string;
  secondaryColor: string;
  isLive: boolean;
  isVerified: boolean;
  category: 'performer' | 'artist';
  merch?: MerchItem[];
  media?: MediaClip[];
  battles?: BattleEntry[];
  sponsors?: SponsorSlot[];
}

// ─── Canvas-level seed data (shown when performer has no real data yet) ───────

const SEED_MERCH: MerchItem[] = [
  { id: 'm1', name: 'Signature Tee',        type: 'shirt',  price: '$34',     emoji: '👕' },
  { id: 'm2', name: 'Crown Edition Hoodie', type: 'hoodie', price: '$72',     emoji: '🧥' },
  { id: 'm3', name: 'Genesis NFT',          type: 'nft',    price: '0.08 ETH',emoji: '💎' },
  { id: 'm4', name: 'Type Beat Pack',       type: 'beat',   price: '$18',     emoji: '🎧' },
];

const SEED_MEDIA: MediaClip[] = [
  { id: 'c1', title: 'Crown Defense Round 3',       type: 'clip',  duration: '4:12',  views: 18400 },
  { id: 'c2', title: 'Live Session — Friday Cypher', type: 'clip',  duration: '22:07', views: 9200  },
  { id: 'c3', title: 'Type Beat: Midnight',          type: 'audio', duration: '2:48',  views: 3100  },
  { id: 'c4', title: 'Battle Highlight Reel',        type: 'clip',  duration: '8:33',  views: 14700 },
];

const SEED_BATTLES: BattleEntry[] = [
  { id: 'b1', opponent: 'Nova Cipher', outcome: 'win',  votesPct: 84, category: 'Cypher'    },
  { id: 'b2', opponent: 'Ray Journey', outcome: 'win',  votesPct: 71, category: 'R&B Vocal' },
  { id: 'b3', opponent: 'K-Reach',     outcome: 'loss', votesPct: 48, category: 'Freestyle' },
];

const SEED_SPONSORS: SponsorSlot[] = [
  { id: 's1', brand: 'SoundWave', label: 'Presented by', color: '#00FFFF' },
  { id: 's2', brand: 'BeatForge', label: 'Powered by',   color: '#FF2DAA' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NeonBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}`, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', border: `1px solid ${color}22` }}>
      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Main Canvas ──────────────────────────────────────────────────────────────

export default function PerformerCanvasMaster({
  displayName, slug, tagline, genre, rank, xp, crownProgress, tippingHeat,
  battleRecord, bio, heroImage, accentColor, secondaryColor, isLive, isVerified,
  category, merch = SEED_MERCH, media = SEED_MEDIA, battles = SEED_BATTLES, sponsors = SEED_SPONSORS,
}: PerformerCanvasData) {
  const [hoveredMerch, setHoveredMerch] = useState<string | null>(null);
  const [hoveredMedia, setHoveredMedia] = useState<string | null>(null);

  const CYAN   = '#00FFFF';
  const FUCHSIA = '#FF2DAA';
  const GOLD   = '#FFD700';
  const BG     = '#06070d';

  const accent  = accentColor   || CYAN;
  const accent2 = secondaryColor || FUCHSIA;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#e4e4f0', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>

      {/* ── Top nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: `1px solid ${accent}22`,
        background: `rgba(6,7,13,0.88)`,
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
      }}>
        <Link href={category === 'performer' ? '/performers' : '/artists'} style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', textTransform: 'uppercase' }}>
          ← {category === 'performer' ? 'Performers' : 'Artists'}
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isLive && (
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: FUCHSIA, background: `${FUCHSIA}18`, border: `1px solid ${FUCHSIA}50`, borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>
              ● LIVE
            </span>
          )}
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: accent, textTransform: 'uppercase', border: `1px solid ${accent}30`, borderRadius: 4, padding: '2px 8px', background: `${accent}0c` }}>
            #{rank} Ranked
          </span>
        </div>
      </nav>

      {/* ── BENTO GRID ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* ROW 1 — Stage + Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>

          {/* Stage Viewport */}
          <div style={{
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 40px ${accent}30, inset 0 0 60px rgba(0,0,0,0.6)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 92%, 97% 100%, 0 100%)',
            background: heroImage ? `url(${heroImage}) center/cover no-repeat` : `linear-gradient(135deg, ${accent}14 0%, #0a0a18 60%, ${accent2}08 100%)`,
            minHeight: 340,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: 20,
          }}>
            {/* Glow overlay */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 50%, ${accent}08 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Top badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {isLive ? (
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', background: FUCHSIA, color: '#fff', borderRadius: 4, padding: '3px 8px', textTransform: 'uppercase' }}>
                    ● LIVE NOW
                  </span>
                ) : (
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.5)', borderRadius: 4, padding: '3px 8px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Last Broadcast
                  </span>
                )}
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', background: `${accent}18`, color: accent, borderRadius: 4, padding: '3px 8px', textTransform: 'uppercase', border: `1px solid ${accent}30` }}>
                  {genre}
                </span>
              </div>
              <Link href={`/live/rooms/cypher-arena`} style={{
                fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
                background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                color: '#000', borderRadius: 6, padding: '6px 16px',
                textDecoration: 'none', textTransform: 'uppercase',
                boxShadow: `0 0 16px ${accent}60`,
              }}>
                Watch Live →
              </Link>
            </div>

            {/* Identity */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', textShadow: `0 0 30px ${accent}60` }}>
                  {displayName}
                </h1>
                {isVerified && <span style={{ fontSize: 14 }} title="Verified">✅</span>}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, fontStyle: 'italic' }}>{tagline}</p>
            </div>
          </div>

          {/* Stats Column */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            clipPath: 'polygon(3% 0, 100% 0, 100% 100%, 0 100%, 0 3%)',
          }}>
            {/* XP + Rank block */}
            <div style={{ background: `linear-gradient(160deg, #0d0d1f, #0a0a16)`, borderRadius: 12, border: `1px solid ${accent}25`, padding: 16, flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.24em', color: accent, textTransform: 'uppercase', marginBottom: 12 }}>Crown Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <StatPill label="Rank"  value={`#${rank}`} color={GOLD} />
                <StatPill label="XP"    value={xp.toLocaleString()} color={accent} />
                <StatPill label="Wins"  value={battleRecord.wins}   color="#4ade80" />
                <StatPill label="Losses" value={battleRecord.losses} color="#f87171" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Crown Progress</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: GOLD, fontFamily: 'monospace' }}>{crownProgress}%</span>
                </div>
                <NeonBar value={crownProgress} color={GOLD} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Tipping Heat</span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: FUCHSIA, fontFamily: 'monospace' }}>{tippingHeat}</span>
                </div>
                <NeonBar value={tippingHeat} color={FUCHSIA} />
              </div>
            </div>

            {/* Quick tip CTA */}
            <div style={{
              borderRadius: 12, border: `1px solid ${FUCHSIA}35`,
              background: `linear-gradient(135deg, ${FUCHSIA}10, ${accent}08)`,
              padding: 14, textAlign: 'center',
            }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Support</div>
              <Link href={`/live/rooms/cypher-arena`} style={{
                display: 'block', padding: '10px', borderRadius: 8,
                background: `linear-gradient(135deg, ${FUCHSIA}, #8a6bff)`,
                color: '#fff', fontWeight: 900, fontSize: 12, letterSpacing: '-0.01em',
                textDecoration: 'none', textTransform: 'uppercase',
                boxShadow: `0 0 20px ${FUCHSIA}40`,
              }}>
                Tip {displayName.split(' ')[0]}
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2 — Bio + Merch Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>

          {/* Bio block — small, not dominant */}
          <div style={{
            gridColumn: 'span 1',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', padding: 16,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 3% 100%, 0 97%)',
          }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase', marginBottom: 10 }}>Bio</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{bio}</p>
            <div style={{ marginTop: 12 }}>
              <Link href={`/rankings?q=${slug}`} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 1 }}>
                View Full Rankings →
              </Link>
            </div>
          </div>

          {/* Merch tiles — 3 slots */}
          {merch.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredMerch(item.id)}
              onMouseLeave={() => setHoveredMerch(null)}
              style={{
                gridColumn: 'span 1',
                borderRadius: 12,
                border: `1px solid ${hoveredMerch === item.id ? accent : 'rgba(255,255,255,0.08)'}`,
                background: hoveredMerch === item.id ? `${accent}08` : 'rgba(255,255,255,0.03)',
                padding: 16, cursor: 'pointer', transition: 'all 0.2s ease',
                clipPath: i % 2 === 0
                  ? 'polygon(0 0, 97% 0, 100% 3%, 100% 100%, 0 100%)'
                  : 'polygon(3% 0, 100% 0, 100% 100%, 0 100%, 0 3%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{item.type}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: GOLD, fontFamily: 'monospace' }}>{item.price}</span>
                <button style={{
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                  background: hoveredMerch === item.id ? accent : 'rgba(255,255,255,0.07)',
                  color: hoveredMerch === item.id ? '#000' : 'rgba(255,255,255,0.5)',
                  border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                  textTransform: 'uppercase', transition: 'all 0.2s ease',
                }}>
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 3 — Media Strip (full width) */}
        <div style={{
          borderRadius: 14, border: `1px solid rgba(255,255,255,0.08)`,
          background: 'rgba(255,255,255,0.02)', padding: '16px 20px',
          marginBottom: 12,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 1% 100%, 0 97%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.24em', color: accent, textTransform: 'uppercase' }}>Media</span>
            <Link href={`/media?performer=${slug}`} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
              All Media →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {media.slice(0, 4).map((clip) => (
              <div
                key={clip.id}
                onMouseEnter={() => setHoveredMedia(clip.id)}
                onMouseLeave={() => setHoveredMedia(null)}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${hoveredMedia === clip.id ? accent2 : 'rgba(255,255,255,0.07)'}`,
                  background: hoveredMedia === clip.id ? `${accent2}08` : 'rgba(255,255,255,0.03)',
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  height: 80,
                  background: `linear-gradient(135deg, ${accent2}12, #0a0a18)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                }}>
                  {clip.type === 'audio' ? '🎵' : '🎬'}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{clip.duration}</span>
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>{clip.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 4 — Battle Record + Sponsor Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12 }}>

          {/* Battle Record */}
          <div style={{
            borderRadius: 14, border: `1px solid ${FUCHSIA}20`,
            background: 'rgba(255,255,255,0.02)', padding: 16,
            clipPath: 'polygon(0 0, 97% 0, 100% 3%, 100% 100%, 0 100%)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.24em', color: FUCHSIA, textTransform: 'uppercase' }}>Battle Record</span>
              <Link href={`/battles?performer=${slug}`} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Full History →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total W', value: battleRecord.wins   },
                { label: 'Total L', value: battleRecord.losses },
                { label: 'W Rate',  value: `${battleRecord.wins + battleRecord.losses > 0 ? Math.round((battleRecord.wins / (battleRecord.wins + battleRecord.losses)) * 100) : 0}%` },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', border: `1px solid ${FUCHSIA}18` }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {battles.slice(0, 4).map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${b.outcome === 'win' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.08)'}`,
                  background: b.outcome === 'win' ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.03)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12 }}>{b.outcome === 'win' ? '🏆' : '💀'}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>vs. {b.opponent}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{b.category}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: b.outcome === 'win' ? '#4ade80' : '#f87171' }}>
                    {b.votesPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Slots — integrated into grid, feel like content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sponsors.map(sp => (
              <div key={sp.id} style={{
                borderRadius: 12, border: `1px solid ${sp.color}30`,
                background: `linear-gradient(135deg, ${sp.color}0c, rgba(0,0,0,0.4))`,
                padding: '18px 20px', flex: 1,
                clipPath: 'polygon(0 0, 100% 0, 100% 90%, 92% 100%, 0 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{sp.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: sp.color, letterSpacing: '-0.02em', textShadow: `0 0 20px ${sp.color}50` }}>{sp.brand}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Featured Partner</div>
              </div>
            ))}
            {/* 4th merch item overflow */}
            {merch[3] && (
              <div style={{
                borderRadius: 12, border: `1px solid ${GOLD}25`,
                background: `${GOLD}06`, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{merch[3].emoji} {merch[3].name}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{merch[3].type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 900, color: GOLD }}>{merch[3].price}</div>
                  <button style={{ fontSize: 8, fontWeight: 900, background: GOLD, color: '#000', border: 'none', borderRadius: 5, padding: '3px 10px', marginTop: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Buy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
