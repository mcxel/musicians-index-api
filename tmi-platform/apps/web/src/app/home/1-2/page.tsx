'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { fetchTrendingArtists, type TrendingArtist } from '@/lib/api/homepage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import {
  PERFORMER_REGISTRY,
  getPerformerById,
} from '@/lib/performers/PerformerRegistry';

const SEED_SPONSORS = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',     tagline: 'Platinum Partner' },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',      tagline: 'Gold Partner'    },
  { id: 'velocity',  name: 'VELOCITY AUDIO',       tagline: 'Gold Partner'    },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',     tagline: 'Silver Partner'  },
  { id: 'crown',     name: 'CROWN & CO.',          tagline: ''                },
  { id: 'frequency', name: 'FREQUENCY LABS',       tagline: ''                },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE', tagline: ''                },
  { id: 'sonic',     name: 'SONIC AXIS',           tagline: ''                },
];

const CATEGORIES = [
  'Hip Hop','R&B','Pop','EDM','Gospel','Rap','Soul','Funk','Jazz','Blues',
  'Rock','Metal','Latin','Reggae','Afrobeats','Dancehall','Country','Folk',
  'Indie','Alternative','Classical','Opera','Spoken Word','Poetry Slam',
  'Stand-Up Comedy','Improv Comedy','Sketch Comedy','Dance Crews','Ballet',
  'Hip Hop Dance','Popping/Locking','Breakdance','DJs','Turntablists',
  'Beat Producers','Instrumentalists','Bands','Groups','A Cappella','Choirs',
  'Magicians','Actors','Spoken Artists','Venues','Promoters',
];

const CAT_THEMES = [
  { accent: '#FF2DAA', glow: '#FF2DAA44', badge: '#AA2DFF' },
  { accent: '#00FFFF', glow: '#00FFFF44', badge: '#FF2DAA' },
  { accent: '#FFD700', glow: '#FFD70044', badge: '#00FFFF' },
  { accent: '#AA2DFF', glow: '#AA2DFF44', badge: '#FFD700' },
  { accent: '#00FF88', glow: '#00FF8844', badge: '#FF2DAA' },
];

function getTheme(catIndex: number) {
  return CAT_THEMES[catIndex % CAT_THEMES.length]!;
}

type BillboardCard = {
  id: string; name: string; profileImageUrl: string; city: string;
  countryName: string; flag: string; category: string; rank: number;
  fanCount: number; likes: number; isLive: boolean; tier: string;
  audienceCount: number; timeLive: string;
};

const FALLBACK_NAMES = [
  'Nova Cipher','Verse.XL','FlowState.J','Ari Volt','Punchline.K',
  'BarGod.T','Vocab.X','Ray Journey','DJ Apex','Lyric.M','SoulFire','Echo.Prime',
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

const TIERS = ['RUBY','Silver','Gold','Platinum','Diamond'];

const buildFallback = (category: string): BillboardCard[] =>
  Array.from({ length: 12 }).map((_, i) => {
    const loc = CITIES[i % CITIES.length]!;
    return {
      id: `${category.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      name: FALLBACK_NAMES[i % FALLBACK_NAMES.length]!,
      profileImageUrl: `https://i.pravatar.cc/400?u=${encodeURIComponent(category)}-${i}`,
      city: loc.city, countryName: loc.country, flag: loc.flag, category,
      rank: i + 1, fanCount: 4000 + i * 1800, likes: 6000 + i * 2300,
      isLive: i % 3 !== 0, tier: TIERS[i % TIERS.length]!,
      audienceCount: 800 + i * 640, timeLive: `${5 + i * 7}m`,
    };
  });

function mapTrending(category: string, rows: TrendingArtist[] | null): BillboardCard[] {
  if (!rows || rows.length === 0) return buildFallback(category);
  return rows.slice(0, 12).map((r, i) => {
    const loc = CITIES[i % CITIES.length]!;
    return {
      id: r.id || `${category}-${i}`,
      name: r.stageName || FALLBACK_NAMES[i % FALLBACK_NAMES.length]!,
      profileImageUrl: r.image || `https://i.pravatar.cc/400?u=${encodeURIComponent(r.slug ?? `${i}`)}`,
      city: loc.city, countryName: loc.country, flag: loc.flag,
      category: r.genres?.[0] || category, rank: i + 1,
      fanCount: Math.max(2000, r.followers || 0),
      likes: Math.max(1500, r.views || 0),
      isLive: i % 3 !== 0,
      tier: TIERS[i % TIERS.length]!,
      audienceCount: Math.max(600, Math.floor((r.views || 0) / 4)),
      timeLive: `${5 + i * 7}m`,
    };
  });
}

// ─── Portrait card ─────────────────────────────────────────────────────────────

function BillboardPortraitCard({
  item, theme,
}: { item: BillboardCard; theme: { accent: string; glow: string; badge: string } }) {
  const tierColors: Record<string, string> = {
    Diamond: '#00FFFF', Platinum: '#E5E4E2', Gold: '#FFD700',
    Silver: '#C0C0C0', RUBY: '#E0115F',
  };
  const tierColor = tierColors[item.tier] || '#fff';

  return (
    <div style={{
      width: '100%', borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${theme.accent}33`, background: 'rgba(5,5,16,0.85)',
      boxShadow: `0 0 20px ${theme.glow}`, display: 'flex',
      flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
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
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
        <img src={item.profileImageUrl} alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy" />
        <div style={{ position: 'absolute', top: 8, left: 8, background: `${theme.accent}DD`,
          color: '#000', fontWeight: 900, fontSize: 11, padding: '3px 7px', borderRadius: 4,
          fontFamily: 'var(--font-orbitron, monospace)', letterSpacing: '0.05em' }}>
          #{item.rank}
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.75)',
          color: tierColor, fontWeight: 800, fontSize: 9, padding: '3px 7px', borderRadius: 4,
          border: `1px solid ${tierColor}55`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {item.tier === 'RUBY' ? 'Ruby' : item.tier}
        </div>
        {item.isLive && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.8)',
            color: '#00FF88', fontWeight: 800, fontSize: 9, padding: '3px 8px', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.05em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', display: 'inline-block' }} />
            LIVE
          </div>
        )}
        {item.isLive && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.75)',
            color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4 }}>
            👁 {item.audienceCount.toLocaleString()}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', pointerEvents: 'none' }} />
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontWeight: 900, fontSize: 11,
            color: theme.accent, letterSpacing: '0.04em', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
            {item.name}
          </span>
          <span style={{ fontSize: 14 }}>{item.flag}</span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>
          {item.city}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          borderTop: `1px solid ${theme.accent}22`, paddingTop: 5, marginTop: 2 }}>
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

// ─── Unified performer identity system ────────────────────────────────────────
// The same BillboardCard object powers both the live lobby wall shaped tiles
// AND the portrait cards. One performer = one identity everywhere on this page.

const SHAPE_CLIP: Record<string, string> = {
  oct:    'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
  hex:    'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)',
  circle: 'circle(50% at 50% 50%)',
  ticket: 'polygon(0 10%,5% 0,95% 0,100% 10%,100% 90%,95% 100%,5% 100%,0 90%)',
  torn:   'polygon(0% 5%,5% 0%,95% 2%,100% 8%,98% 95%,92% 100%,5% 98%,0% 92%)',
  ribbon: 'polygon(0 0,100% 0,100% 75%,50% 100%,0 75%)',
  cinema: 'none',
};

function getCardShape(card: BillboardCard): string {
  const cat = card.category.toLowerCase();
  if (cat === 'venues' || cat === 'promoters') return 'ticket';
  if (['dance crews','hip hop dance','ballet','breakdance','popping/locking'].includes(cat)) return 'hex';
  if (cat === 'sponsors') return 'ribbon';
  if (card.name.toLowerCase().includes(' vs ')) return 'hex';
  if (cat === 'gospel' && card.audienceCount > 4000) return 'torn';
  if (cat === 'djs' && card.audienceCount > 2500) return 'cinema';
  return 'oct';
}

function getCardAccent(card: BillboardCard): string {
  const map: Record<string, string> = {
    Diamond: '#00E5FF', Platinum: '#E5E4E2', Gold: '#FFD700', Silver: '#C0C0C0', RUBY: '#FF2DAA',
  };
  return map[card.tier] ?? '#FF2DAA';
}

// Wall tiles and portrait cards both read from the same PerformerRegistry.
// One performer = one identity everywhere — no inline duplicate arrays.
const GLOBAL_LIVE_POOL: BillboardCard[] = PERFORMER_REGISTRY;

type WallFilter = 'global' | 'performer' | 'fan' | 'battle' | 'venue' | 'magazine';

function filterLivePool(wall: WallFilter): BillboardCard[] {
  if (wall === 'global')    return GLOBAL_LIVE_POOL;
  if (wall === 'performer') return GLOBAL_LIVE_POOL.filter(c => !['Venues','Sponsors','Dance Crews','Hip Hop Dance','Breakdance','Ballet','Popping/Locking'].includes(c.category));
  if (wall === 'fan')       return GLOBAL_LIVE_POOL.filter(c => c.audienceCount < 250);
  if (wall === 'battle')    return GLOBAL_LIVE_POOL.filter(c => c.name.toLowerCase().includes(' vs ') || c.category === 'Rap');
  if (wall === 'venue')     return GLOBAL_LIVE_POOL.filter(c => c.category === 'Venues');
  if (wall === 'magazine')  return GLOBAL_LIVE_POOL.filter(c => c.audienceCount > 3000);
  return GLOBAL_LIVE_POOL;
}

// ─── Performer live tile ───────────────────────────────────────────────────────

function PerformerLiveTile({ card, onJoin }: { card: BillboardCard; onJoin: (id: string) => void }) {
  const shape = getCardShape(card);
  const accent = getCardAccent(card);
  const clip = SHAPE_CLIP[shape] ?? 'none';
  const isWide = shape === 'cinema';
  const isBattle = card.name.toLowerCase().includes(' vs ');
  const size = isWide ? 'auto' : (shape === 'circle' ? 88 : shape === 'ribbon' ? 80 : 102);

  return (
    <div
      onClick={() => onJoin(card.id)}
      style={{
        position: 'relative',
        width: isWide ? '100%' : size,
        height: isWide ? 62 : size,
        clipPath: clip,
        backgroundImage: `url(${card.profileImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(5,5,16,0.95)',
        border: `2px solid ${accent}`,
        cursor: 'pointer',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: `0 0 14px ${accent}44`,
        transition: 'transform .18s, box-shadow .18s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px ${accent}99`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 14px ${accent}44`;
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 4, left: isWide ? 8 : 4, background: '#E63000', color: '#fff', fontSize: 7, fontWeight: 800, padding: '1px 5px', borderRadius: 3, letterSpacing: '.08em', zIndex: 5 }}>
        LIVE
      </div>
      <div style={{ position: 'absolute', top: 4, right: isWide ? 8 : 4, background: 'rgba(0,0,0,.72)', color: '#00E5FF', fontSize: 7, padding: '1px 5px', borderRadius: 3, zIndex: 5, fontWeight: 600 }}>
        👁 {card.audienceCount.toLocaleString()}
      </div>
      {isBattle && (
        <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,.78)', color: '#FF1493', fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 4, zIndex: 5, border: '1px solid rgba(255,20,147,.4)' }}>
          VS
        </div>
      )}
      <div style={{ position: 'absolute', bottom: isWide ? 22 : 18, right: isWide ? 8 : 4, zIndex: 5 }}>
        <span style={{ background: 'rgba(0,0,0,.72)', color: accent, fontSize: 6, fontWeight: 800, padding: '1px 4px', borderRadius: 3, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {card.tier === 'RUBY' ? 'Ruby' : card.tier}
        </span>
      </div>
      <div style={{ position: 'absolute', bottom: isWide ? 6 : 4, left: isWide ? 8 : 4, right: isWide ? 8 : 4, zIndex: 5 }}>
        <div style={{ color: '#fff', fontSize: isWide ? 10 : 8, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,.95)', lineHeight: 1.2 }}>
          {card.name}
        </div>
        {!isWide && (
          <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 6, lineHeight: 1.2 }}>{card.category}</div>
        )}
      </div>
      {card.category === 'Sponsors' && (
        <div style={{ position: 'absolute', bottom: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#FFD700', zIndex: 5 }} />
      )}
    </div>
  );
}

// ─── Wall tabs ─────────────────────────────────────────────────────────────────

const WALL_TABS: { key: WallFilter; label: string }[] = [
  { key: 'global',    label: '🌐 Global Live'    },
  { key: 'performer', label: '🎤 Performer Live'  },
  { key: 'fan',       label: '💃 Fan Live'        },
  { key: 'battle',    label: '⚔️ Battle Wall'     },
  { key: 'venue',     label: '🏟️ Venue Wall'      },
  { key: 'magazine',  label: '📰 Magazine Wall'   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home12Page() {
  const [catIndex, setCatIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState<BillboardCard[]>(() => buildFallback(CATEGORIES[0]!));
  const [transitioning, setTransitioning] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<UniversalRoom | null>(null);
  const [wallFilter, setWallFilter] = useState<WallFilter>('global');
  const [liveCount, setLiveCount] = useState(21);

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

  useEffect(() => {
    const id = setInterval(() => setLiveCount(n => n + Math.floor(Math.random() * 3 - 1)), 4000);
    return () => clearInterval(id);
  }, []);

  const currentCategory = CATEGORIES[catIndex]!;
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

  const wallCards = filterLivePool(wallFilter);

  function handleJoinCard(id: string) {
    const card = getPerformerById(id) ?? items.find(x => x.id === id);
    if (!card) return;
    setPendingRoom({
      id: `${card.id}-live`,
      title: card.name,
      viewers: card.audienceCount,
      status: 'live',
      access: (card.tier === 'Diamond' || card.tier === 'Platinum') ? 'vip' : 'free',
      accentColor: getCardAccent(card),
      roomRoute: `/live/rooms/${encodeURIComponent(card.id)}?from=billboard`,
      venueIndex: 0,
      shape: 'hex',
    });
  }

  return (
    <main style={{ background: '#050510', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      {pendingRoom && <LobbyEntryFlow room={pendingRoom} onClose={() => setPendingRoom(null)} />}

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 30% 40%, ${theme.glow}, transparent 60%)`,
        transition: 'background 1s' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(5,5,16,.9)',
        backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 900,
          color: theme.accent, transition: 'color 0.5s', textShadow: `0 0 12px ${theme.glow}` }}>
          TMI BILLBOARD WORLD
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['1','1-2','2','3','4','5'].map(n => (
            <Link key={n} href={`/home/${n}`} style={{
              padding: '5px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700,
              textDecoration: 'none', letterSpacing: '.05em',
              background: n === '1-2' ? `${theme.accent}20` : 'transparent',
              color: n === '1-2' ? theme.accent : 'rgba(255,255,255,.45)',
              border: `1px solid ${n === '1-2' ? theme.accent : 'rgba(255,255,255,.1)'}`,
            }}>
              {n}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, overflow: 'hidden',
        background: 'rgba(0,0,0,.6)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '5px 0' }}>
        <div style={{ display: 'inline-flex', gap: 60, whiteSpace: 'nowrap', paddingLeft: 40,
          animation: 'scrollLeft 38s linear infinite', fontSize: 10, color: 'rgba(255,255,255,.55)' }}>
          {tickerStr}&nbsp;&nbsp;⚡&nbsp;&nbsp;TMI BILLBOARD WORLD — {CATEGORIES.length} CATEGORIES&nbsp;&nbsp;⚡&nbsp;&nbsp;GLOBAL RANKINGS LIVE
          &nbsp;&nbsp;&nbsp;&nbsp;
          {tickerStr}&nbsp;&nbsp;⚡&nbsp;&nbsp;TMI BILLBOARD WORLD — {CATEGORIES.length} CATEGORIES&nbsp;&nbsp;⚡&nbsp;&nbsp;GLOBAL RANKINGS LIVE
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes blink12 { 0%,100% { opacity:1; } 50% { opacity:.2; } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <SponsorRail sponsors={SEED_SPONSORS} zone="home-1-2-top" />
      </div>

      {/* ══ BILLBOARD LIVE LOBBY WALL ══ */}
      <div style={{ position: 'relative', zIndex: 10,
        background: 'linear-gradient(180deg,rgba(0,229,255,.1),rgba(5,8,21,.98))',
        borderBottom: '2px solid rgba(0,229,255,.25)', padding: '14px 20px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)',
              fontSize: 'clamp(16px,3vw,24px)', fontWeight: 900, color: '#00E5FF',
              textShadow: '0 0 14px #00E5FF88', letterSpacing: '.05em', lineHeight: 1.1 }}>
              BILLBOARD LIVE LOBBY WALL
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.12em', marginTop: 2 }}>
              WHO IS HERE RIGHT NOW? · THE LIVE BROADCAST NETWORK OF TMI
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E63000',
              animation: 'blink12 1.4s ease-in-out infinite' }} />
            <span style={{ color: '#E63000', fontSize: 11, fontWeight: 700 }}>
              {liveCount} rooms live now
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
          {WALL_TABS.map(t => (
            <button key={t.key} onClick={() => setWallFilter(t.key)} style={{
              padding: '5px 10px', borderRadius: 6,
              border: `0.5px solid ${wallFilter === t.key ? '#00E5FF' : 'rgba(255,255,255,.15)'}`,
              fontSize: 10, cursor: 'pointer',
              background: wallFilter === t.key ? 'rgba(0,229,255,.15)' : 'transparent',
              color: wallFilter === t.key ? '#00E5FF' : 'rgba(255,255,255,.55)',
              whiteSpace: 'nowrap', fontWeight: wallFilter === t.key ? 700 : 400,
              transition: 'all .15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Live tiles — same BillboardCard identity as portrait grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', minHeight: 116 }}>
          {wallCards.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 11, padding: '20px 0' }}>
              No live performers in this view right now
            </div>
          ) : wallCards.map(card => (
            <PerformerLiveTile key={card.id} card={card} onJoin={handleJoinCard} />
          ))}
        </div>

        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 9, color: 'rgba(255,255,255,.3)', flexWrap: 'wrap' }}>
          <span>User goes live</span><span>→</span>
          <span>Public room created</span><span>→</span>
          <span>AudienceScene + bots</span><span>→</span>
          <span>Live tile appears here</span><span>→</span>
          <span style={{ color: '#00E5FF' }}>Profile shows LIVE</span>
        </div>
      </div>

      {/* ══ GENRE BILLBOARD — portrait cards ══ */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: 28 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '.3em', color: theme.accent, fontWeight: 800, marginBottom: 4 }}>
              GLOBAL BILLBOARD — TOP PERFORMERS
            </div>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)',
              fontSize: 'clamp(13px,2.5vw,20px)', fontWeight: 900, color: '#fff',
              letterSpacing: '.06em', textShadow: `0 0 16px ${theme.glow}` }}>
              WHO IS HERE?
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => advanceCat(-1)} style={{
              background: 'transparent', border: `1px solid ${theme.accent}55`,
              borderRadius: 6, color: theme.accent, padding: '7px 14px',
              fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: '.1em' }}>
              ‹ PREV
            </button>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(12px,2.5vw,18px)',
              fontWeight: 900, color: theme.accent, textShadow: `0 0 18px ${theme.glow}`,
              letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .4s' }}>
              [{currentCategory}]
            </span>
            <button onClick={() => advanceCat(1)} style={{
              background: 'transparent', border: `1px solid ${theme.accent}55`,
              borderRadius: 6, color: theme.accent, padding: '7px 14px',
              fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: '.1em' }}>
              NEXT ›
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap',
          padding: '0 24px 20px', maxWidth: 1400, margin: '0 auto' }}>
          {CATEGORIES.map((cat, i) => (
            <button key={cat} onClick={() => {
              setTransitioning(true);
              setTimeout(() => { setCatIndex(i); setTransitioning(false); }, 150);
            }} style={{
              background: i === catIndex ? `${theme.accent}22` : 'transparent',
              border: `1px solid ${i === catIndex ? theme.accent : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 20, color: i === catIndex ? theme.accent : 'rgba(255,255,255,0.45)',
              fontSize: 9, fontWeight: i === catIndex ? 800 : 500, padding: '4px 10px',
              cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'all .2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 24px 60px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(22px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.25,1,0.5,1)',
        }}>
          {items.map(item => item.isLive ? (
            <button key={item.id} onClick={() => handleJoinCard(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block' }}
              aria-label={`Join live room for ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </button>
          ) : (
            <Link key={item.id} href={`/performers/${encodeURIComponent(item.id)}`}
              style={{ textDecoration: 'none' }}
              aria-label={`Open performer ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </Link>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <EventReel zone="home-1-2" />
      </div>
    </main>
  );
}
