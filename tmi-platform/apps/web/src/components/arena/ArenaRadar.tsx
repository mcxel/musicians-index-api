'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ArenaSlot {
  genre: string;
  emoji: string;
  accent: string;
  status: 'LIVE' | 'STARTING' | 'NEXT' | 'OPEN';
  artist1: string;
  artist2: string | null;
  audience: number;
  countdown: number; // seconds until next event (0 = live now)
  prize: string;
  xp: number;
  slug: string;
}

const GENRE_ARENAS: ArenaSlot[] = [
  { genre: 'Hip-Hop',  emoji: '🎤', accent: '#FFD700', status: 'LIVE',     artist1: 'Wavetek',      artist2: 'King Verse',  audience: 1842, countdown: 0,   prize: '500 XP',  xp: 500, slug: 'hip-hop'  },
  { genre: 'R&B',      emoji: '🔥', accent: '#FF2DAA', status: 'STARTING', artist1: 'Lani Flame',   artist2: 'Zuri Bloom',  audience: 934,  countdown: 45,  prize: '400 XP',  xp: 400, slug: 'rnb'      },
  { genre: 'Rap',      emoji: '🎙️', accent: '#39FF14', status: 'STARTING', artist1: 'Bobby Stanley',artist2: 'Cold Spark',  audience: 612,  countdown: 90,  prize: '350 XP',  xp: 350, slug: 'rap'      },
  { genre: 'EDM',      emoji: '🎧', accent: '#00FFFF', status: 'LIVE',     artist1: 'DJ Blend',     artist2: 'Neon Vibe',   audience: 2210, countdown: 0,   prize: '600 XP',  xp: 600, slug: 'edm'      },
  { genre: 'Gospel',   emoji: '🙏', accent: '#00FF88', status: 'NEXT',     artist1: 'Blessed Voice', artist2: null,         audience: 287,  countdown: 180, prize: '300 XP',  xp: 300, slug: 'gospel'   },
  { genre: 'Jazz',     emoji: '🎷', accent: '#AA2DFF', status: 'NEXT',     artist1: 'Global Vibes', artist2: null,          audience: 198,  countdown: 240, prize: '250 XP',  xp: 250, slug: 'jazz'     },
  { genre: 'Pop',      emoji: '🎀', accent: '#FF6B35', status: 'OPEN',     artist1: 'Poptronica',   artist2: null,          audience: 455,  countdown: 300, prize: '400 XP',  xp: 400, slug: 'pop'      },
  { genre: 'Soul',     emoji: '✨', accent: '#C8A2C8', status: 'OPEN',     artist1: 'Open Mic',     artist2: null,          audience: 102,  countdown: 360, prize: '200 XP',  xp: 200, slug: 'soul'     },
  { genre: 'Cypher',   emoji: '⚡', accent: '#FF2DAA', status: 'LIVE',     artist1: '8 performers', artist2: null,          audience: 3240, countdown: 0,   prize: '800 XP',  xp: 800, slug: 'cypher'   },
  { genre: 'Open Mic', emoji: '🎵', accent: '#00FF88', status: 'LIVE',     artist1: 'Open Queue',   artist2: null,          audience: 512,  countdown: 0,   prize: '150 XP',  xp: 150, slug: 'open-mic' },
];

function statusColor(s: ArenaSlot['status']) {
  if (s === 'LIVE')     return '#FF2DAA';
  if (s === 'STARTING') return '#FFD700';
  if (s === 'NEXT')     return '#00FFFF';
  return '#555';
}

function formatCountdown(sec: number) {
  if (sec <= 0) return 'LIVE NOW';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface Props {
  compact?: boolean;
  accent?: string;
  maxItems?: number;
}

export default function ArenaRadar({ compact = false, accent = '#FF2DAA', maxItems = 10 }: Props) {
  const [arenas, setArenas] = useState<ArenaSlot[]>(GENRE_ARENAS.slice(0, maxItems));
  const [activeIdx, setActiveIdx] = useState(0);
  const [ticks, setTicks] = useState<Record<string, number>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate active card every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx(i => (i + 1) % arenas.length);
    }, 4000);
    return () => clearInterval(id);
  }, [arenas.length]);

  // Countdown tick
  useEffect(() => {
    const id = setInterval(() => {
      setArenas(prev => prev.map(a => ({
        ...a,
        countdown: Math.max(0, a.countdown - 1),
        status: a.countdown <= 1 && a.status === 'STARTING' ? 'LIVE' : a.status,
        audience: a.audience,
      })));
    }, 1000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, []);

  if (compact) {
    const slot = arenas[activeIdx]!;
    return (
      <div style={{
        background: 'rgba(5,5,16,0.96)',
        border: `1px solid ${slot.accent}44`,
        borderRadius: 12,
        padding: '12px 14px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.4s ease',
      }}>
        <style>{`@keyframes arenaRadarPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: slot.accent, letterSpacing: '0.2em' }}>⚡ ARENA RADAR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor(slot.status), animation: slot.status === 'LIVE' ? 'arenaRadarPulse 1.2s infinite' : 'none' }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: statusColor(slot.status) }}>{slot.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>{slot.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{slot.genre} Arena</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              {slot.artist1}{slot.artist2 ? ` vs ${slot.artist2}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            👁 {slot.audience.toLocaleString()} · {formatCountdown(slot.countdown)} · {slot.prize}
          </div>
          <Link href={`/arena/${slot.slug}`} style={{ fontSize: 9, fontWeight: 900, color: '#050510', background: slot.accent, borderRadius: 4, padding: '3px 8px', textDecoration: 'none', letterSpacing: '0.06em' }}>
            JOIN
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
          {arenas.map((_, i) => (
            <div key={i} onClick={() => setActiveIdx(i)} style={{ flex: 1, height: 2, borderRadius: 1, background: i === activeIdx ? slot.accent : 'rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(5,5,16,0.98)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`@keyframes radarPulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes radarSlide{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'radarPulse 1.2s ease-in-out infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.18em' }}>ARENA RADAR</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>· LIVE NETWORK</span>
        </div>
        <Link href="/arena" style={{ fontSize: 8, fontWeight: 800, color: accent, textDecoration: 'none', letterSpacing: '0.12em' }}>ALL ARENAS →</Link>
      </div>

      <div style={{ maxHeight: compact ? 200 : 400, overflowY: 'auto' }}>
        {arenas.map((slot, i) => (
          <div key={slot.slug} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: i === activeIdx ? `${slot.accent}08` : 'transparent',
            transition: 'background 0.3s ease',
            cursor: 'pointer',
          }} onClick={() => setActiveIdx(i)}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{slot.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{slot.genre}</span>
                <span style={{ fontSize: 7, fontWeight: 900, color: statusColor(slot.status), background: `${statusColor(slot.status)}18`, border: `1px solid ${statusColor(slot.status)}33`, borderRadius: 4, padding: '1px 5px', letterSpacing: '0.1em' }}>
                  {slot.status === 'LIVE' ? '● LIVE' : slot.status}
                </span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {slot.artist1}{slot.artist2 ? ` vs ${slot.artist2}` : ''} · {slot.audience.toLocaleString()} watching
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: slot.status === 'LIVE' ? '#FF2DAA' : slot.accent, marginBottom: 3 }}>
                {formatCountdown(slot.countdown)}
              </div>
              <div style={{ fontSize: 8, color: '#FFD700', fontWeight: 700 }}>{slot.prize}</div>
            </div>
            <Link
              href={`/arena/${slot.slug}`}
              onClick={e => e.stopPropagation()}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 9, fontWeight: 900, textDecoration: 'none', letterSpacing: '0.08em',
                background: slot.status === 'LIVE' ? slot.accent : 'rgba(255,255,255,0.07)',
                color: slot.status === 'LIVE' ? '#050510' : 'rgba(255,255,255,0.5)',
                border: slot.status === 'LIVE' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
              }}
            >
              {slot.status === 'LIVE' ? 'JOIN' : 'WATCH'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
