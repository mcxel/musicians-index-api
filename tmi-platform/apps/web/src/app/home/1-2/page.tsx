'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from '../1/Home1.module.css';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { fetchTrendingArtists, type TrendingArtist } from '@/lib/api/homepage';

// 45 categories — all performer types + audience-side verticals
const CATEGORIES = [
  'Hip Hop',       'R&B',           'Pop',           'EDM',           'Gospel',
  'Rap',           'Soul',          'Funk',          'Jazz',          'Blues',
  'Rock',          'Metal',         'Latin',         'Reggae',        'Afrobeats',
  'Dancehall',     'Country',       'Folk',          'Indie',         'Alternative',
  'Classical',     'Opera',         'Spoken Word',   'Poetry Slam',   'Stand-Up Comedy',
  'Improv Comedy', 'Sketch Comedy', 'Dance Crews',   'Ballet',        'Hip Hop Dance',
  'Popping/Locking','Breakdance',   'DJs',           'Turntablists',  'Beat Producers',
  'Instrumentalists','Bands',       'Groups',        'A Cappella',    'Choirs',
  'Magicians',     'Actors',        'Spoken Artists','Venues',        'Promoters',
];

// Color theme per category index — cycles through TMI palette
const CAT_THEMES = [
  { accent: '#FF2DAA', glow: '#FF2DAA44', badge: '#AA2DFF' },
  { accent: '#00FFFF', glow: '#00FFFF44', badge: '#FF2DAA' },
  { accent: '#FFD700', glow: '#FFD70044', badge: '#00FFFF' },
  { accent: '#AA2DFF', glow: '#AA2DFF44', badge: '#FFD700' },
  { accent: '#00FF88', glow: '#00FF8844', badge: '#FF2DAA' },
];

function getTheme(catIndex: number) {
  return CAT_THEMES[catIndex % CAT_THEMES.length];
}

type BillboardCard = {
  id: string;
  name: string;
  profileImageUrl: string;
  city: string;
  countryName: string;
  flag: string;
  category: string;
  rank: number;
  fanCount: number;
  likes: number;
  isLive: boolean;
  tier: string;
  audienceCount: number;
  timeLive: string;
};

const FALLBACK_NAMES = [
  'Nova Cipher', 'Verse.XL', 'FlowState.J', 'Ari Volt', 'Punchline.K',
  'BarGod.T', 'Vocab.X', 'Ray Journey', 'DJ Apex', 'Lyric.M',
  'SoulFire', 'Echo.Prime',
];

const CITIES = [
  { city: 'Atlanta, GA', country: 'United States', flag: '🇺🇸' },
  { city: 'London, UK',  country: 'United Kingdom', flag: '🇬🇧' },
  { city: 'Tokyo, JP',   country: 'Japan',          flag: '🇯🇵' },
  { city: 'Los Angeles', country: 'United States',  flag: '🇺🇸' },
  { city: 'Toronto, CA', country: 'Canada',         flag: '🇨🇦' },
  { city: 'Lagos, NG',   country: 'Nigeria',        flag: '🇳🇬' },
  { city: 'Paris, FR',   country: 'France',         flag: '🇫🇷' },
  { city: 'Miami, FL',   country: 'United States',  flag: '🇺🇸' },
];

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const buildFallback = (category: string): BillboardCard[] =>
  Array.from({ length: 12 }).map((_, i) => {
    const loc = CITIES[i % CITIES.length];
    return {
      id: `${category.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      name: FALLBACK_NAMES[i % FALLBACK_NAMES.length],
      profileImageUrl: `https://i.pravatar.cc/400?u=${encodeURIComponent(category)}-${i}`,
      city: loc.city,
      countryName: loc.country,
      flag: loc.flag,
      category,
      rank: i + 1,
      fanCount: 4000 + i * 1800,
      likes: 6000 + i * 2300,
      isLive: i % 3 !== 0,
      tier: TIERS[i % TIERS.length],
      audienceCount: 800 + i * 640,
      timeLive: `${5 + i * 7}m`,
    };
  });

function mapTrending(category: string, rows: TrendingArtist[] | null): BillboardCard[] {
  if (!rows || rows.length === 0) return buildFallback(category);
  return rows.slice(0, 12).map((r, i) => {
    const loc = CITIES[i % CITIES.length];
    return {
      id: r.id || `${category}-${i}`,
      name: r.stageName || FALLBACK_NAMES[i % FALLBACK_NAMES.length],
      profileImageUrl: r.image || `https://i.pravatar.cc/400?u=${encodeURIComponent(r.slug ?? `${i}`)}`,
      city: loc.city,
      countryName: loc.country,
      flag: loc.flag,
      category: r.genres?.[0] || category,
      rank: i + 1,
      fanCount: Math.max(2000, r.followers || 0),
      likes: Math.max(1500, r.views || 0),
      isLive: i % 3 !== 0,
      tier: TIERS[i % TIERS.length],
      audienceCount: Math.max(600, Math.floor((r.views || 0) / 4)),
      timeLive: `${5 + i * 7}m`,
    };
  });
}

function BillboardPortraitCard({
  item,
  theme,
}: {
  item: BillboardCard;
  theme: { accent: string; glow: string; badge: string };
}) {
  const tierColors: Record<string, string> = {
    Diamond: '#00FFFF', Platinum: '#E5E4E2', Gold: '#FFD700',
    Silver: '#C0C0C0', Bronze: '#CD7F32',
  };
  const tierColor = tierColors[item.tier] || '#fff';

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${theme.accent}33`,
        background: 'rgba(5,5,16,0.85)',
        boxShadow: `0 0 20px ${theme.glow}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${theme.glow}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${theme.glow}`;
      }}
    >
      {/* Portrait image — 4:5 aspect ratio */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
        <img
          src={item.profileImageUrl}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />

        {/* Rank badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: `${theme.accent}DD`,
          color: '#000',
          fontWeight: 900,
          fontSize: 11,
          padding: '3px 7px',
          borderRadius: 4,
          fontFamily: 'var(--font-orbitron, monospace)',
          letterSpacing: '0.05em',
        }}>
          #{item.rank}
        </div>

        {/* Tier badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.75)',
          color: tierColor,
          fontWeight: 800,
          fontSize: 9,
          padding: '3px 7px',
          borderRadius: 4,
          border: `1px solid ${tierColor}55`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {item.tier}
        </div>

        {/* Live indicator */}
        {item.isLive && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.8)',
            color: '#00FF88',
            fontWeight: 800,
            fontSize: 9,
            padding: '3px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            letterSpacing: '0.05em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            LIVE
          </div>
        )}

        {/* Audience count overlay */}
        {item.isLive && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: 4,
          }}>
            👁 {item.audienceCount.toLocaleString()}
          </div>
        )}

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '40%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Card footer */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-orbitron, monospace)',
            fontWeight: 900,
            fontSize: 11,
            color: theme.accent,
            letterSpacing: '0.04em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '65%',
          }}>
            {item.name}
          </span>
          <span style={{ fontSize: 14 }}>{item.flag}</span>
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>
          {item.city}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.accent}22`, paddingTop: 5, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
            ❤ <strong style={{ color: '#fff' }}>{(item.fanCount / 1000).toFixed(1)}k</strong>
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
            👍 <strong style={{ color: '#fff' }}>{(item.likes / 1000).toFixed(1)}k</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home12Page() {
  const [catIndex, setCatIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState<BillboardCard[]>(() => buildFallback(CATEGORIES[0]));
  const [transitioning, setTransitioning] = useState(false);

  const advanceCat = useCallback((dir: 1 | -1) => {
    setTransitioning(true);
    setTimeout(() => {
      setCatIndex(prev => (prev + dir + CATEGORIES.length) % CATEGORIES.length);
      setTransitioning(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => advanceCat(1), 8000);
    return () => clearInterval(timer);
  }, [isPaused, advanceCat]);

  const currentCategory = CATEGORIES[catIndex];
  const theme = getTheme(catIndex);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rows = await fetchTrendingArtists(12);
      if (!alive) return;
      setItems(mapTrending(currentCategory, rows));
    })();
    return () => { alive = false; };
  }, [currentCategory]);

  const latestNews = getLatestEditorialArticles(5);
  const tickerStr = latestNews.map(a => `[${a.category.toUpperCase()}] ${a.headline}`).join('  ⚡  ');

  return (
    <main className={styles.root} style={{ background: '#050510', minHeight: '100vh' }}>
      {/* Background */}
      <div className={styles.underlay} style={{
        backgroundImage: 'url("/tmi-source/_converted_webp_all/Tmi Homepage 1-2.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: 0.5,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 40%, ${theme.glow}, transparent 60%)`, transition: 'background 1s' }} />
      </div>

      {/* Top nav */}
      <div className={styles.topBar}>
        <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 900, color: theme.accent, transition: 'color 0.5s', textShadow: `0 0 12px ${theme.glow}` }}>
          TMI BILLBOARD WORLD
        </div>
        <div className={styles.navButtons}>
          {['1', '1-2', '2', '3', '4', '5'].map(n => (
            <Link key={n} href={`/home/${n}`} className={styles.tmiBtn} style={n === '1-2' ? { color: theme.accent, borderColor: theme.accent, background: `${theme.accent}15` } : {}}>
              {n}
            </Link>
          ))}
        </div>
      </div>

      {/* News ticker */}
      <div className={styles.tickerWrap}>
        <div className={styles.tickerInner}>
          {tickerStr}  ⚡  TMI BILLBOARD WORLD — {CATEGORIES.length} CATEGORIES  ⚡  GLOBAL RANKINGS LIVE
        </div>
      </div>

      {/* Main content */}
      <div
        style={{ position: 'relative', zIndex: 10, paddingTop: 90 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Category selector */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 10, flexWrap: 'wrap', padding: '0 24px' }}>
          <button
            onClick={() => advanceCat(-1)}
            style={{ background: 'transparent', border: `1px solid ${theme.accent}55`, borderRadius: 6, color: theme.accent, padding: '8px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontWeight: 700, letterSpacing: '0.1em' }}
          >
            ‹ PREV
          </button>
          <h2 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'clamp(14px, 3vw, 22px)',
            fontWeight: 900,
            color: theme.accent,
            textShadow: `0 0 20px ${theme.glow}`,
            letterSpacing: '0.1em',
            margin: 0,
            textTransform: 'uppercase',
            transition: 'color 0.4s, text-shadow 0.4s',
          }}>
            [{currentCategory}]
          </h2>
          <button
            onClick={() => advanceCat(1)}
            style={{ background: 'transparent', border: `1px solid ${theme.accent}55`, borderRadius: 6, color: theme.accent, padding: '8px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontWeight: 700, letterSpacing: '0.1em' }}
          >
            NEXT ›
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap', padding: '0 24px 20px', maxWidth: 1100, margin: '0 auto' }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => { setCatIndex(i); setTransitioning(false); }, 150);
              }}
              style={{
                background: i === catIndex ? `${theme.accent}22` : 'transparent',
                border: `1px solid ${i === catIndex ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20,
                color: i === catIndex ? theme.accent : 'rgba(255,255,255,0.45)',
                fontSize: 9,
                fontWeight: i === catIndex ? 800 : 500,
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portrait card grid */}
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px 60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16,
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.2s',
        }}>
          {items.map(item => (
            <Link
              key={item.id}
              href={`/performers/${encodeURIComponent(item.id)}`}
              style={{ textDecoration: 'none' }}
              aria-label={`Open performer ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
