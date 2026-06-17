'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { fetchTrendingArtists, type TrendingArtist } from '@/lib/api/homepage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';
import { getPerformerById } from '@/lib/performers/PerformerRegistry';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';
import DiscoveryRail from '@/components/discovery/DiscoveryRail';

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
  // Rule 2: Motion Poster chain
  introVideoUrl?: string;
  motionPosterUrl?: string;
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
    const regP = r.id ? getPerformerById(r.id) : undefined;
    return {
      id: r.id || `${category}-${i}`,
      name: r.stageName || FALLBACK_NAMES[i % FALLBACK_NAMES.length]!,
      profileImageUrl: r.image || regP?.profileImageUrl || `https://i.pravatar.cc/400?u=${encodeURIComponent(r.slug ?? `${i}`)}`,
      city: loc.city, countryName: loc.country, flag: loc.flag,
      category: r.genres?.[0] || category, rank: i + 1,
      fanCount: Math.max(2000, r.followers || 0),
      likes: Math.max(1500, r.views || 0),
      isLive: i % 3 !== 0,
      tier: TIERS[i % TIERS.length]!,
      audienceCount: Math.max(600, Math.floor((r.views || 0) / 4)),
      timeLive: `${5 + i * 7}m`,
      introVideoUrl: regP?.introVideoUrl,
      motionPosterUrl: regP?.motionPosterUrl,
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
        {/* Rule 2: LIVE VIDEO → MOTION POSTER → STATIC IMAGE */}
        <MotionPosterPlayer
          isLive={item.isLive}
          liveRoomRoute={`/live/rooms/${encodeURIComponent(item.id)}?from=billboard`}
          introVideoUrl={item.introVideoUrl}
          motionPosterUrl={item.motionPosterUrl}
          staticImageUrl={item.profileImageUrl}
          alt={item.name}
          audienceCount={item.audienceCount}
          showLiveOverlay={false}
          width="100%"
          height="100%"
        />
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
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88',
              display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
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

export default function Home12Page() {
  const [catIndex, setCatIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState<BillboardCard[]>(() => buildFallback(CATEGORIES[0]!));
  const [transitioning, setTransitioning] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<UniversalRoom | null>(null);
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

  function handleJoinCard(id: string) {
    const card = getPerformerById(id) ?? items.find(x => x.id === id);
    if (!card) return;
    const tierColors: Record<string, string> = {
      Diamond: '#00E5FF', Platinum: '#E5E4E2', Gold: '#FFD700',
      Silver: '#C0C0C0', RUBY: '#FF2DAA',
    };
    setPendingRoom({
      id: `${card.id}-live`,
      title: card.name,
      viewers: card.audienceCount,
      status: 'live',
      access: (card.tier === 'Diamond' || card.tier === 'Platinum') ? 'vip' : 'free',
      accentColor: tierColors[card.tier] || '#FF2DAA',
      roomRoute: `/live/rooms/${encodeURIComponent(card.id)}?from=billboard`,
      venueIndex: 0,
      shape: 'hex',
    });
  }

  return (
    <main style={{ background: '#050510', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      {pendingRoom && <LobbyEntryFlow room={pendingRoom} onClose={() => setPendingRoom(null)} />}

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
            }} >
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
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <SponsorRail sponsors={SEED_SPONSORS} zone="home-1-2-top" />
      </div>

      <BillboardLiveWall mode="home" maxTiles={12} title="BILLBOARD LIVE LOBBY WALL" showActions className="p-5 bg-gradient-to-b from-cyan-500/10 to-blue-900/50 border-b-2 border-cyan-500/40" />

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
            <button key={item.id} onClick={() => handleJoinCard(item.id)} style={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block' }}
              aria-label={`Join live room for ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </button>
          ) : (
            <Link key={item.id} href={`/performers/${encodeURIComponent(item.id)}`} style={{ textDecoration: 'none' }}
              aria-label={`Open performer ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </Link>
          ))}
        </div>
      </div>

      {/* Rule 12: No Empty Inventory — ad slot before the discovery rails */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto' }}>
        <UnifiedAdSlot venue="home-1-2" slotKey="homepageMid" format="rectangle" label="ADVERTISEMENT" style={{ margin: '0 24px 24px', minHeight: 250 }} accentColor={theme.accent} />
      </div>

      {/* Rule 6: Discovery Rails — no dead ends on the billboard surface */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '0 24px 28px' }}>
        <DiscoveryRail type="performers" label="🌐 WHO ELSE IS HERE" accentColor="#00FFFF" />
        <DiscoveryRail type="liveRooms" label="🎥 LIVE NOW" accentColor="#E63000" />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <EventReel zone="home-1-2" />
      </div>
    </main>
  );
}
