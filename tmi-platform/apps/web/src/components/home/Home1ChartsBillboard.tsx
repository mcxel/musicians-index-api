'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ChartEntry { rank: number; name: string; plays: string; delta: number; img: string; slug: string; }

function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

const GENRES = ['Hip-Hop', 'R&B', 'Trap', 'Electronic', 'Pop', 'Latin', 'Rock', 'Soul', 'Gospel', 'Jazz'];

const GENRE_ACCENT: Record<string, string> = {
  'Hip-Hop': '#FF2DAA', 'R&B': '#AA2DFF', 'Trap': '#FF6B35',
  'Electronic': '#00FFFF', 'Pop': '#FFD700', 'Latin': '#00FF88',
  'Rock': '#FF3B5C', 'Soul': '#FF8C00', 'Gospel': '#ADFF2F', 'Jazz': '#40C4FF',
};

const CHART_ENTRIES: Record<string, Array<{ rank: number; name: string; plays: string; delta: number; img: string; slug: string }>> = {
  'Hip-Hop': [
    { rank: 1, name: 'Crown Mic', plays: '2.4M', delta: 2, img: '/tmi-curated/mag-01.jpg', slug: 'crown-mic' },
    { rank: 2, name: 'Neon Verse', plays: '1.8M', delta: -1, img: '/tmi-curated/mag-02.jpg', slug: 'neon-verse' },
    { rank: 3, name: 'Delta Flame', plays: '1.2M', delta: 0, img: '/tmi-curated/mag-03.jpg', slug: 'delta-flame' },
    { rank: 4, name: 'Ghost Ink', plays: '980K', delta: 4, img: '/tmi-curated/mag-04.jpg', slug: 'ghost-ink' },
    { rank: 5, name: 'Street Rep', plays: '870K', delta: -2, img: '/tmi-curated/mag-05.jpg', slug: 'street-rep' },
  ],
  'R&B': [
    { rank: 1, name: 'Soul Bars', plays: '3.1M', delta: 1, img: '/tmi-curated/mag-10.jpg', slug: 'soul-bars' },
    { rank: 2, name: 'Velvet Voice', plays: '2.2M', delta: 0, img: '/tmi-curated/mag-11.jpg', slug: 'velvet-voice' },
    { rank: 3, name: 'Rhythm Lane', plays: '1.6M', delta: 3, img: '/tmi-curated/mag-12.jpg', slug: 'rhythm-lane' },
    { rank: 4, name: 'Blue Note', plays: '1.1M', delta: -1, img: '/tmi-curated/mag-13.jpg', slug: 'blue-note' },
    { rank: 5, name: 'Silk Thread', plays: '900K', delta: 2, img: '/tmi-curated/mag-14.jpg', slug: 'silk-thread' },
  ],
  'Trap': [
    { rank: 1, name: 'Bass King', plays: '1.9M', delta: 0, img: '/tmi-curated/mag-20.jpg', slug: 'bass-king' },
    { rank: 2, name: 'Fire Drop', plays: '1.4M', delta: 5, img: '/tmi-curated/mag-21.jpg', slug: 'fire-drop' },
    { rank: 3, name: 'Dark Wave', plays: '1.0M', delta: -1, img: '/tmi-curated/mag-22.jpg', slug: 'dark-wave' },
    { rank: 4, name: 'Drill Press', plays: '780K', delta: 2, img: '/tmi-curated/mag-23.jpg', slug: 'drill-press' },
    { rank: 5, name: 'Night Shift', plays: '620K', delta: -3, img: '/tmi-curated/mag-24.jpg', slug: 'night-shift' },
  ],
  'Electronic': [
    { rank: 1, name: 'Synth Wave', plays: '2.7M', delta: 1, img: '/tmi-curated/mag-30.jpg', slug: 'synth-wave' },
    { rank: 2, name: 'Pulse Grid', plays: '1.9M', delta: -2, img: '/tmi-curated/mag-31.jpg', slug: 'pulse-grid' },
    { rank: 3, name: 'Neon Bass', plays: '1.3M', delta: 0, img: '/tmi-curated/mag-32.jpg', slug: 'neon-bass' },
    { rank: 4, name: 'Circuit Break', plays: '1.1M', delta: 3, img: '/tmi-curated/mag-33.jpg', slug: 'circuit-break' },
    { rank: 5, name: 'Voltage', plays: '880K', delta: 1, img: '/tmi-curated/mag-34.jpg', slug: 'voltage' },
  ],
  'Pop': [
    { rank: 1, name: 'Star Light', plays: '4.2M', delta: 0, img: '/tmi-curated/mag-40.jpg', slug: 'star-light' },
    { rank: 2, name: 'Glow Up', plays: '3.1M', delta: 2, img: '/tmi-curated/mag-41.jpg', slug: 'glow-up' },
    { rank: 3, name: 'Cloud Nine', plays: '2.4M', delta: -1, img: '/tmi-curated/mag-42.jpg', slug: 'cloud-nine' },
    { rank: 4, name: 'Sunshine', plays: '1.8M', delta: 4, img: '/tmi-curated/mag-43.jpg', slug: 'sunshine' },
    { rank: 5, name: 'Harmony', plays: '1.2M', delta: -2, img: '/tmi-curated/mag-44.jpg', slug: 'harmony' },
  ],
};

// Fill missing genres with placeholder data
GENRES.forEach((g) => {
  if (!CHART_ENTRIES[g]) {
    CHART_ENTRIES[g] = Array.from({ length: 5 }, (_, i) => ({
      rank: i + 1, name: `${g} Artist ${i + 1}`, plays: `${(5 - i) * 200}K`,
      delta: Math.floor(Math.random() * 5) - 2,
      img: `/tmi-curated/mag-${50 + i}.jpg`, slug: `${g.toLowerCase()}-artist-${i + 1}`,
    }));
  }
});

export default function Home1ChartsBillboard() {
  const [activeGenre, setActiveGenre] = useState('Hip-Hop');
  const [autoplay, setAutoplay] = useState(true);
  const [liveCache, setLiveCache] = useState<Record<string, ChartEntry[]>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Auto-rotate genres every 6 seconds
  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      setActiveGenre((g) => {
        const idx = GENRES.indexOf(g);
        return GENRES[(idx + 1) % GENRES.length];
      });
    }, 6000);
    return () => clearInterval(t);
  }, [autoplay]);

  // Fetch live chart data for the active genre
  useEffect(() => {
    if (liveCache[activeGenre] || fetchingRef.current.has(activeGenre)) return;
    fetchingRef.current.add(activeGenre);
    fetch(`/api/homepage/charts?genre=${encodeURIComponent(activeGenre.toLowerCase())}&limit=5`)
      .then((r) => r.json())
      .then((payload) => {
        const items: unknown[] = Array.isArray(payload?.items) ? payload.items : [];
        if (items.length === 0) return;
        const mapped: ChartEntry[] = items.map((item: unknown, i: number) => {
          const e = item as Record<string, unknown>;
          const name = typeof e.artist === 'string' ? e.artist : typeof e.title === 'string' ? e.title : `Artist ${i + 1}`;
          const slug = typeof e.slug === 'string' ? e.slug : name.toLowerCase().replace(/\s+/g, '-');
          const plays = typeof e.score === 'number' ? formatPlays(e.score) : typeof e.plays === 'string' ? e.plays : `${(5 - i) * 200}K`;
          return { rank: i + 1, name, plays, delta: 0, img: `/tmi-curated/mag-${(i + 1) * 10}.jpg`, slug };
        });
        setLiveCache((prev) => ({ ...prev, [activeGenre]: mapped }));
      })
      .catch(() => { fetchingRef.current.delete(activeGenre); });
  }, [activeGenre, liveCache]);

  const accent = GENRE_ACCENT[activeGenre] ?? '#00FFFF';
  const entries: ChartEntry[] = liveCache[activeGenre] ?? CHART_ENTRIES[activeGenre] ?? [];

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: accent, fontWeight: 800 }}>TMI CHARTS BILLBOARD</div>
          <h2 style={{ margin: '4px 0 0', fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#fff' }}>Top Charts by Genre</h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GENRES.slice(0, 6).map((g) => (
            <button
              key={g}
              onClick={() => { setActiveGenre(g); setAutoplay(false); }}
              style={{
                padding: '6px 12px', borderRadius: 20, border: `1px solid ${g === activeGenre ? GENRE_ACCENT[g] : 'rgba(255,255,255,0.15)'}`,
                background: g === activeGenre ? `${GENRE_ACCENT[g]}22` : 'transparent',
                color: g === activeGenre ? GENRE_ACCENT[g] : 'rgba(255,255,255,0.55)',
                fontSize: 10, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em',
                transition: 'all 0.2s',
              }}
            >
              {g.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        {/* Hero chart entry — #1 */}
        <AnimatePresence mode="wait">
          {entries[0] && (
            <motion.div
              key={`${activeGenre}-hero`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <Link href={`/artists/${entries[0].slug}`} style={{ textDecoration: 'none', color: '#fff' }}>
                <div style={{
                  position: 'relative', borderRadius: 14, overflow: 'hidden',
                  minHeight: 280,
                  background: `linear-gradient(145deg, ${accent}33, rgba(5,5,16,0.85)), url('${entries[0].img}') center/cover`,
                  border: `1.5px solid ${accent}60`,
                  boxShadow: `0 0 32px ${accent}30`,
                }}>
                  <div style={{ position: 'absolute', top: 12, left: 12, background: accent, color: '#000', fontWeight: 900, fontSize: 11, padding: '4px 10px', borderRadius: 4 }}>
                    #1 {activeGenre.toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                    <div style={{ fontSize: 'clamp(1.2rem,2.5vw,1.8rem)', fontWeight: 900 }}>{entries[0].name}</div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 12 }}>
                      <span style={{ color: accent }}>▶ {entries[0].plays} plays</span>
                      <span style={{ color: entries[0].delta > 0 ? '#00FF88' : entries[0].delta < 0 ? '#FF3B5C' : '#888' }}>
                        {entries[0].delta > 0 ? `▲ ${entries[0].delta}` : entries[0].delta < 0 ? `▼ ${Math.abs(entries[0].delta)}` : '— same'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart list — #2-5 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeGenre}-list`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {entries.slice(1).map((entry) => (
              <Link key={entry.slug} href={`/artists/${entry.slug}`} style={{ textDecoration: 'none', color: '#fff' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: `linear-gradient(90deg, ${accent}14, rgba(5,5,16,0.6))`,
                  border: `1px solid ${accent}30`,
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: `${accent}40` }}>
                    <div style={{ width: '100%', height: '100%', backgroundImage: `url('${entry.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: accent, marginRight: 6 }}>#{entry.rank}</span>{entry.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{entry.plays} plays</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, flexShrink: 0, color: entry.delta > 0 ? '#00FF88' : entry.delta < 0 ? '#FF3B5C' : '#888' }}>
                    {entry.delta > 0 ? `▲${entry.delta}` : entry.delta < 0 ? `▼${Math.abs(entry.delta)}` : '—'}
                  </div>
                </div>
              </Link>
            ))}
            <Link href={`/charts?genre=${activeGenre}`} style={{
              display: 'block', textAlign: 'center', padding: '10px', marginTop: 4,
              background: `${accent}18`, color: accent, borderRadius: 8,
              fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textDecoration: 'none',
              border: `1px solid ${accent}35`,
            }}>
              FULL {activeGenre.toUpperCase()} CHART →
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
