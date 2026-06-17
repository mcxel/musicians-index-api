'use client';

/**
 * Home1CoverPage — TMI Homepage 1, full tabloid-pop redesign.
 *
 * DROP FILE AT:
 *   apps/web/src/components/home/Home1CoverPage.tsx
 *
 * THEN IN apps/web/src/app/home/1/page.tsx replace:
 *   import Home1OrbitalMagazine from '@/components/home/Home1OrbitalMagazine';
 * with:
 *   import Home1CoverPage from '@/components/home/Home1CoverPage';
 * and swap <Home1OrbitalMagazine /> → <Home1CoverPage />
 *
 * WHAT THIS DOES:
 *  - 10 performers per genre, cycle through genres every 6 s
 *  - Every performer card routes to /articles/performer/[slug]
 *  - No real face photos — genre-colored emoji avatars
 *  - Orbital ring kept (360 spin), bright teal/gold palette
 *  - Tabloid overlays: VOTING LIVE, GENRE BATTLE, CYPHER ARENA OPEN
 *  - Bottom: Weekly Cyphers bar with article link
 *  - Typecheck-safe, no external deps beyond Next.js
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { getCrownHolder, PERFORMER_REGISTRY, getFeaturedFreePerformers, type PerformerIdentity } from '@/lib/performers/PerformerRegistry';
import { getVenueBookingSlots, type VenueBookingSlot } from '@/lib/venues/VenueRegistry';
import { fetchUpcomingEvents } from '@/lib/api/homepage';
import AdSenseSlot, { AD_SLOTS } from '@/components/ads/AdSenseSlot';
import { getActiveSponsorForZone } from '@/lib/commerce/SponsorRegistry';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';

// ─── Genre + performer data (10 per genre) ────────────────────────────────────

interface Performer {
  slug: string;
  name: string;
  emoji: string;
  rank: number;
  score: number;
  genre: string;
  image?: string;
  isLive?: boolean;
  liveRoomRoute?: string;
}

const GENRE_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  'Hip-Hop': { color: '#FFD700', bg: '#2D1A00', emoji: '🎤' },
  'R&B':     { color: '#FF2DAA', bg: '#2D001A', emoji: '🎵' },
  'Gospel':  { color: '#00FF88', bg: '#001A0D', emoji: '🙏' },
  'Jazz':    { color: '#AA2DFF', bg: '#1A001A', emoji: '🎷' },
  'EDM':     { color: '#00C8FF', bg: '#001A2D', emoji: '🎧' },
  'Pop':     { color: '#FF6B35', bg: '#2D1000', emoji: '🎀' },
  'Soul':    { color: '#FFB800', bg: '#2D1F00', emoji: '🕯️' },
  'Rap':     { color: '#39FF14', bg: '#001A00', emoji: '💬' },
};

// GENRE_KEYS must come from GENRE_CONFIG (GENRE_DATA doesn't exist yet at this point)
const GENRE_KEYS = Object.keys(GENRE_CONFIG);

const GENRE_DATA = GENRE_KEYS.reduce((acc, key) => {
  const config = GENRE_CONFIG[key]!;
  const matched = PERFORMER_REGISTRY.filter((p: PerformerIdentity) => p.category === key);

  const performers: Performer[] = Array.from({ length: 10 }).map((_, i) => {
    const p = matched[i];
    if (p) {
      return {
        slug: p.slug,
        name: p.name,
        emoji: '👤', // Use a generic emoji, image is now primary
        rank: p.rank,
        score: p.xp,
        genre: key,
        image: p.profileImageUrl,
        isLive: p.isLive,
        liveRoomRoute: p.liveRoomRoute,
      };
    }
    return {
      slug: `rising-${key.toLowerCase()}-${i}`,
      name: `Rising ${key}`,
      emoji: '✨',
      rank: i + 1,
      score: Math.max(100, 1000 - i * 100),
      genre: key,
      image: `https://i.pravatar.cc/150?u=${key}-${i}`,
    };
  });

  acc[key] = { ...config, performers };
  return acc;
}, {} as Record<string, { color: string; bg: string; emoji: string; performers: Performer[] }>);

// Positions for 10 orbit cards (angle in degrees, radius 44% of container)
function getOrbitPos(i: number, total: number, radius: number) {
  const angle = (i / total) * 360 - 90; // start from top
  const rad = (angle * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  };
}

// ─── Full CHANNEL_ROTATION — 31 messages covering all roles + B2B ────────────

const TICKER_MSGS = [
  '🎵 ALL PERFORMERS WELCOME — JOIN NOW',
  '🌍 FREE GLOBAL PROMOTION FOR ALL ARTISTS',
  '📈 CLIMB THE GLOBAL RANKINGS TODAY',
  '🔍 GET DISCOVERED WORLDWIDE — SIGN UP FREE',
  '🎧 DJs WANTED — JOIN DJ BATTLE NIGHT',
  '🎧 DJ DISCOVERY CHARTS NOW OPEN',
  '😂 DIGITAL COMEDY NIGHT — COMEDIANS WANTED',
  '😂 JOKE-OFF BATTLES — ALL COMEDY STYLES ACCEPTED',
  '💃 DANCE-OFF CHALLENGES — DANCERS WANTED',
  '💃 ALL DANCE CREWS WELCOME — SIGN UP NOW',
  '🎹 PRODUCERS WANTED — BEAT BATTLES LIVE',
  '🎤 SINGERS WELCOME — VOCAL SHOWCASE OPEN',
  '🎸 BANDS WANTED — LIVE PERFORMANCE SLOTS OPEN',
  '🥁 ALL INSTRUMENTALISTS WELCOME',
  '🎭 ACTORS · MAGICIANS · SPOKEN WORD ARTISTS',
  '🏢 VENUES WANTED — BOOK TALENT DIRECT',
  '📣 PROMOTERS WANTED — PROMOTE SHOWS WORLDWIDE',
  '💼 SPONSORS WANTED — ADVERTISE FROM $25',
  '📺 ADVERTISERS WANTED — REACH LIVE AUDIENCES',
  '🎟 SELL TICKETS THROUGH TMI',
  '💰 EARN TIPS LIVE — PERFORMERS & DJs',
  '📅 GET BOOKED — LIST YOUR AVAILABILITY',
  '🏆 CHALLENGE YOUR SONG — SONG FOR SONG',
  '⚔️ JOIN BATTLE ARENA — COMPETE TONIGHT',
  '🎤 CYPHER ARENA OPEN — DROP IN ANYTIME',
  '🔥 DRUM BATTLE LIVE RIGHT NOW',
  '👑 WHO TOOK THE CROWN? VOTE NOW',
  '💥 GENRE BATTLE — HIP-HOP VS R&B',
  '🚀 NEW PERFORMERS JUST INDEXED',
  '🗳️ VOTING LIVE — CROWN SHIFTING',
  '🔊 STREAM & WIN RADIO IS LIVE',
];

// ─── P6: Independent performer monitor tiles ──────────────────────────────────

function PerformerMonitor({
  performers, offsetIdx, intervalMs, accentColor, delayMs, channelNum,
}: {
  performers: Performer[];
  offsetIdx: number;
  intervalMs: number;
  accentColor: string;
  delayMs: number;
  channelNum: number;
}) {
  const [idx, setIdx] = useState(offsetIdx % performers.length);
  useEffect(() => {
    let iid: ReturnType<typeof setInterval>;
    const tid = setTimeout(() => {
      iid = setInterval(() => setIdx((x) => (x + 1) % performers.length), intervalMs);
    }, delayMs);
    return () => { clearTimeout(tid); clearInterval(iid); };
  }, [performers.length, intervalMs, delayMs]);

  const p = performers[idx]!;
  return (
    <div style={{ flex: 1, background: 'rgba(5,8,21,0.92)', border: `2px solid ${accentColor}44`, borderRadius: 8, overflow: 'hidden', position: 'relative', minHeight: 110 }}>
      {/* Scanline overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)', pointerEvents: 'none', zIndex: 5 }} />
      {/* Channel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px', background: `${accentColor}18`, borderBottom: `1px solid ${accentColor}33` }}>
        <span style={{ fontSize: 7, fontWeight: 900, color: accentColor, letterSpacing: '0.15em', fontFamily: "'Inter',sans-serif" }}>CH-{channelNum} LIVE</span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E63000', display: 'inline-block', boxShadow: '0 0 4px #E63000', animation: 'h1Pulse 1.5s infinite' }} />
      </div>
      {/* Performer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 6px', gap: 3 }}>
        <div style={{ fontSize: 28, lineHeight: 1 }}>{p.emoji}</div>
        <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', textAlign: 'center', fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>{p.name}</div>
        <div style={{ fontSize: 7, color: accentColor, background: `${accentColor}22`, borderRadius: 8, padding: '1px 5px', fontFamily: "'Inter',sans-serif" }}>{p.genre}</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter',sans-serif" }}>#{p.rank} · {p.score.toLocaleString()} pts</div>
      </div>
      {/* Timer progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `${accentColor}18` }}>
        <div style={{ height: 2, background: accentColor, width: '100%', transformOrigin: 'left center', animation: `h1MonitorBar ${intervalMs / 1000}s linear infinite` }} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const HERO_PHRASES = [
  'WHO TOOK THE CROWN?',
  "THE WORLD'S STAGE",
  "WHO'S NEXT?",
  'DISCOVER THE FUTURE',
  'FANS • PERFORMERS • VENUES',
  'LIVE • BATTLE • CYPHER • WIN',
  'YOUR JOURNEY STARTS HERE',
  "THE MUSICIAN'S INDEX",
];

export default function Home1CoverPage() {
  const [genreIdx, setGenreIdx] = useState(0);
  const [orbitDeg, setOrbitDeg] = useState(0);
  const [voteCount, setVoteCount] = useState(4812);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [starburst, setStarburst] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [leftTab, setLeftTab] = useState(0);
  const [rightTab, setRightTab] = useState(0);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [underlayDir, setUnderlayDir] = useState<'left' | 'right'>('right');
  const [pendingOrbit, setPendingOrbit] = useState<UniversalRoom | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const [venues, setVenues] = useState<VenueBookingSlot[]>(() => getVenueBookingSlots(3));

  useEffect(() => {
    // Try to upgrade to real upcoming event data from the API.
    // Falls back silently to VenueRegistry data already in state.
    fetchUpcomingEvents(3).then(events => {
      if (events && events.length > 0) {
        const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'] as const;
        setVenues(events.map(e => {
          const date = new Date(e.startsAt);
          return { day: days[date.getDay()]!, venue: e.venue ?? 'Main Arena', slug: e.id, bookRoute: `/venues/book?venue=${e.id}` };
        }));
      }
    }).catch(() => {});
  }, []);

  const genreKey = GENRE_KEYS[genreIdx % GENRE_KEYS.length]!;
  const genre = GENRE_DATA[genreKey]!;
  const performers = genre.performers;
  // Crown holder always comes from the PerformerRegistry — the real global #1 by XP.
  const crownData = getCrownHolder();
  const crowdHolder = {
    slug: crownData.slug,
    name: crownData.name,
    profileImageUrl: crownData.profileImageUrl,
    profileRoute: crownData.profileRoute,
    introVideoUrl: crownData.introVideoUrl,
    motionPosterUrl: crownData.motionPosterUrl,
    isLive: crownData.isLive,
    liveRoomRoute: crownData.liveRoomRoute,
    audienceCount: crownData.audienceCount,
  };

  // Orbit spin
  useEffect(() => {
    const spin = (ts: number) => {
      if (lastRef.current) {
        const dt = ts - lastRef.current;
        setOrbitDeg((d) => (d + dt * 0.015) % 360);
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Genre cycle every 6s with starburst flash
  useEffect(() => {
    const id = setInterval(() => {
      setStarburst(true);
      setTimeout(() => {
        setGenreIdx((i) => i + 1);
        setStarburst(false);
      }, 800);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Vote count tick
  useEffect(() => {
    const id = setInterval(() => {
      setVoteCount((v) => v + Math.floor(Math.random() * 7 + 1));
    }, 820);
    return () => clearInterval(id);
  }, []);

  // Hero headline rotation — cycles brand phrases every 4s with fade
  useEffect(() => {
    const id = setInterval(() => {
      setHeroVisible(false);
      setTimeout(() => {
        setHeroIdx((i) => (i + 1) % HERO_PHRASES.length);
        setHeroVisible(true);
      }, 380);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const accentColor = genre.color;
  const bgColor = genre.bg;

  return (
    <>
    {pendingOrbit && <LobbyEntryFlow room={pendingOrbit} onClose={() => setPendingOrbit(null)} />}
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${bgColor} 0%, #0a0614 45%, #050310 100%)`,
        color: '#fff',
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700;900&display=swap');

        @keyframes h1Spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes h1CounterSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes h1CrownFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes h1TypeColor {
          0%   { color: #fff;    text-shadow: 0 0 8px rgba(255,255,255,0.4); }
          25%  { color: #FFD700; text-shadow: 0 0 14px rgba(255,215,0,0.8); }
          50%  { color: #00FF7F; text-shadow: 0 0 14px rgba(0,255,127,0.8); }
          75%  { color: #E63000; text-shadow: 0 0 14px rgba(230,48,0,0.8); }
          100% { color: #fff;    text-shadow: 0 0 8px rgba(255,255,255,0.4); }
        }
        @keyframes h1ColorBg {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes h1RailRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
        @keyframes h1BadgePulse {
          0%,100% { box-shadow: 0 0 6px rgba(255,45,170,0.4); border-color: rgba(255,45,170,0.6); }
          50%     { box-shadow: 0 0 16px rgba(255,45,170,0.9); border-color: rgba(255,45,170,1); }
        }
        @keyframes h1Pulse {
          0%, 100% { box-shadow: 0 0 20px ${accentColor}55; }
          50% { box-shadow: 0 0 40px ${accentColor}99, 0 0 80px ${accentColor}33; }
        }
        @keyframes h1TickerScroll {
          from { transform: translateX(100vw); }
          to   { transform: translateX(-100%); }
        }
        @keyframes h1StarburstRay {
          0%   { transform: scaleY(0) translateX(-50%); opacity: 1; }
          50%  { transform: scaleY(1) translateX(-50%); opacity: 0.8; }
          100% { transform: scaleY(1.6) translateX(-50%); opacity: 0; }
        }
        @keyframes h1BlobA {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(60px,-40px) scale(1.12); }
          66%     { transform: translate(-40px,30px) scale(0.9); }
        }
        @keyframes h1BlobB {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(-50px,50px) scale(0.88); }
          66%     { transform: translate(70px,-30px) scale(1.1); }
        }
        @keyframes h1BlobC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(40px,60px) scale(1.08); }
        }
        @keyframes h1StickerPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes h1CardHover {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        @keyframes h1ConfettiDrift {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(60px) rotate(180deg); opacity: 0; }
        }
        @keyframes h1MonitorBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes h1MagType {
          0%        { opacity: 0; max-width: 0; letter-spacing: 0.5em; }
          5%, 75%   { opacity: 1; max-width: 300px; letter-spacing: 0.35em; }
          90%, 100% { opacity: 0; max-width: 300px; letter-spacing: 0.35em; }
        }
        @keyframes h1TabloidScroll {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
        @keyframes h1FloatStar {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.45; }
          50%       { transform: translateY(-8px) scale(1.15); opacity: 0.75; }
        }
      `}</style>

      {/* ── Background confetti triangles ── */}
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8 + (i % 5) * 4,
            height: 8 + (i % 5) * 4,
            background: [accentColor, '#FFD700', '#FF2DAA', '#00FF88', '#AA2DFF'][i % 5],
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            left: `${(i * 13 + 3) % 100}%`,
            top: `${(i * 17 + 5) % 90}%`,
            opacity: 0.18,
            transform: `rotate(${i * 37}deg)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ══ BETA BAR — top of page ══ */}
      <div style={{ background: 'rgba(230,48,0,0.18)', borderBottom: '1px solid rgba(230,48,0,0.32)', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 8 }}>
        <div style={{ color: '#E63000', fontWeight: 700, letterSpacing: '0.12em', fontFamily: "'Inter',sans-serif" }}>✦ TMI BETA SEASON</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter',sans-serif" }}>Founding Beta Member · Purchases &amp; unlocks persist permanently</div>
        <Link href="/about/beta" style={{ textDecoration: 'none', color: '#FFD700', fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>DETAILS →</Link>
      </div>

      {/* ── Voting LIVE banner ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: `linear-gradient(90deg, #1a0050 0%, ${accentColor}33 50%, #1a0050 100%)`,
          borderBottom: `2px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '7px 16px',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: accentColor,
            letterSpacing: '0.15em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          🗳️ VOTING LIVE!
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>|</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif" }}>
          CROWN UPDATING IN REAL-TIME... {voteCount.toLocaleString()} votes cast
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>|</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: '#FFD700',
            letterSpacing: '0.1em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {genreKey.toUpperCase()} GENRE BATTLE!
        </span>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          paddingTop: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >

        {/* ── Geometric 80s background accents (pointer-events:none, no layout impact) ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {/* Gold diamond */}
          <div style={{ position: 'absolute', top: '8%', left: '3%', width: 28, height: 28, background: 'rgba(255,215,0,0.18)', transform: 'rotate(45deg)', border: '1px solid rgba(255,215,0,0.35)' }} />
          {/* Pink triangle */}
          <div style={{ position: 'absolute', top: '12%', right: '4%', width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '32px solid rgba(255,45,170,0.15)' }} />
          {/* Cyan triangle */}
          <div style={{ position: 'absolute', top: '35%', left: '1%', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderBottom: '24px solid rgba(0,229,255,0.12)' }} />
          {/* Purple circle */}
          <div style={{ position: 'absolute', bottom: '30%', right: '2%', width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(170,45,255,0.22)', background: 'rgba(170,45,255,0.06)' }} />
          {/* Gold diamond bottom-left */}
          <div style={{ position: 'absolute', bottom: '18%', left: '2%', width: 18, height: 18, background: 'rgba(255,215,0,0.12)', transform: 'rotate(45deg)', border: '1px solid rgba(255,215,0,0.2)' }} />
          {/* Cyan rectangle accent */}
          <div style={{ position: 'absolute', top: '55%', right: '1.5%', width: 8, height: 40, background: 'rgba(0,229,255,0.09)', border: '1px solid rgba(0,229,255,0.18)' }} />
          {/* Pink small square */}
          <div style={{ position: 'absolute', top: '68%', left: '1%', width: 12, height: 12, background: 'rgba(255,45,170,0.12)', transform: 'rotate(20deg)' }} />
        </div>

        {/* ── Masthead ── */}
        <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 16, zIndex: 10, position: 'relative', maxHeight: '250px' }}>
          {/* Floating star decorations */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 0 }}>
            {[
              { top: 10, left: '8%',  size: 12, delay: '0s',    char: '⭐' },
              { top: 22, left: '15%', size: 9,  delay: '0.6s',  char: '✦' },
              { top: 6,  left: '85%', size: 11, delay: '1.1s',  char: '⭐' },
              { top: 18, left: '78%', size: 8,  delay: '0.3s',  char: '✦' },
              { top: 38, left: '5%',  size: 8,  delay: '1.8s',  char: '✦' },
              { top: 34, left: '91%', size: 9,  delay: '0.9s',  char: '✦' },
            ].map((s, i) => (
              <span key={i} style={{ position: 'absolute', top: s.top, left: s.left, fontSize: s.size, opacity: 0.45, animation: `h1FloatStar 3s ease-in-out infinite`, animationDelay: s.delay, display: 'inline-block' }}>{s.char}</span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              overflow: 'visible',
              fontSize: 'clamp(12px, 2.8vw, 19px)',
              fontWeight: 900,
              letterSpacing: '0.3em',
              fontFamily: "'Inter', sans-serif",
              marginBottom: 4,
            }}
          >
            {"THE MUSICIAN'S INDEX".split('').map((char, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  minWidth: char === ' ' ? '0.5em' : 'auto',
                  animation: 'h1TypeColor 4s ease-in-out infinite',
                  animationDelay: `${index * 0.07}s`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
          {/* MAGAZINE typewriter — types in, holds, fades out, loops ~3s */}
          <div
            style={{
              overflow: 'hidden',
              height: 14,
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: accentColor,
                letterSpacing: '0.35em',
                fontFamily: "'Inter', sans-serif",
                textTransform: 'uppercase',
                display: 'inline-block',
                overflow: 'hidden',
                animation: 'h1MagType 3.2s ease-in-out infinite',
                whiteSpace: 'nowrap',
              }}
            >
              MAGAZINE
            </span>
          </div>
          <div
            style={{
              fontSize: 'clamp(20px, 4.2vw, 32px)',
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              background: `linear-gradient(135deg, #fff 0%, ${accentColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.04em',
              lineHeight: 1,
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 0.38s ease',
              minHeight: '1.1em',
            }}
          >
            {HERO_PHRASES[heroIdx]}
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 3,
              padding: '3px 16px',
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}55`,
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 900,
              color: accentColor,
              letterSpacing: '0.18em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {genre.emoji} {genreKey.toUpperCase()} · WEEK {Math.ceil((Date.now() / (7 * 24 * 60 * 60 * 1000)) % 52) || 1}
          </div>

          {/* ── Status badges row: VOTING LIVE | VOTES | CROWN UPDATING ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,45,170,0.18)', border: '1px solid rgba(255,45,170,0.6)', borderRadius: 4, padding: '3px 10px', animation: 'h1BadgePulse 2s ease-in-out infinite' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2DAA', display: 'inline-block', animation: 'h1Pulse 1s infinite' }} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#FF2DAA', fontFamily: "'Inter',sans-serif" }}>VOTING LIVE</span>
            </div>
            <div style={{ background: 'rgba(255,215,0,0.14)', border: '1px solid rgba(255,215,0,0.5)', borderRadius: 4, padding: '3px 12px', fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: '#FFD700' }}>
              {voteCount.toLocaleString()} VOTES
            </div>
            <div style={{ background: 'rgba(230,48,0,0.18)', border: '1px solid rgba(230,48,0,0.5)', borderRadius: 4, padding: '3px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#E63000', fontFamily: "'Inter',sans-serif" }}>CROWN UPDATING</div>
          </div>

          {/* ── Challenge banner slider ── */}
          <div style={{ background: 'rgba(123,0,255,0.18)', border: '1px solid rgba(123,0,255,0.4)', borderRadius: 6, padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, maxWidth: 600, width: '100%' }}>
            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 9, cursor: 'pointer' }}>◀</button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif" }}>CHALLENGE YOUR SONG HERE</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>SONG FOR SONG · WORK FOR WORK</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link href="/battles/challenge" style={{ fontSize: 9, fontWeight: 700, color: '#00E5FF', textDecoration: 'none', fontFamily: "'Inter',sans-serif" }}>START NOW</Link>
              <button style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 9, cursor: 'pointer' }}>▶</button>
            </div>
          </div>

          {/* ── Action buttons: 7 clickable buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
            {[
              { label: 'JOIN FREE',       href: '/signup',             bg: 'rgba(0,255,127,0.14)', color: '#00FF7F', border: 'rgba(0,255,127,0.4)' },
              { label: 'LOGIN',           href: '/login',              bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.2)' },
              { label: 'CHALLENGE SONG',  href: '/battles/challenge',  bg: 'rgba(255,215,0,0.14)', color: '#FFD700', border: 'rgba(255,215,0,0.35)' },
              { label: 'CYPHER ARENA',    href: '/live/rooms/cypher-arena', bg: 'rgba(0,229,255,0.12)', color: '#00E5FF', border: 'rgba(0,229,255,0.3)' },
              { label: 'MAGAZINE',        href: '/magazine',           bg: 'rgba(255,45,170,0.12)', color: '#FF2DAA', border: 'rgba(255,45,170,0.3)' },
              { label: 'SPONSOR',         href: '/sponsors/apply',     bg: 'rgba(155,89,182,0.12)', color: '#9B59B6', border: 'rgba(155,89,182,0.3)' },
              { label: 'ADVERTISE',       href: '/sponsors/advertise', bg: 'rgba(230,48,0,0.12)',  color: '#E63000', border: 'rgba(230,48,0,0.3)' },
            ].map((btn) => (
              <Link key={btn.label} href={btn.href} style={{ textDecoration: 'none' }}>
                <button style={{ background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, borderRadius: 5, padding: '5px 11px', fontSize: 9, fontWeight: 800, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.05em' }}>{btn.label}</button>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Orbital section wrapper — tabloid underlay lives here (position:absolute) ── */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>

        {/* TABLOID MAGAZINE UNDERLAY — scrolls behind the orbital (blueprint spec) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: `${underlayDir === 'left' ? 'h1TabloidScroll' : 'h1RailRight'} 18s linear infinite`, opacity: 0.75, height: '100%', alignItems: 'stretch' }}>
            {[0, 1, 2].map(rep =>
              [
                { bg: '#FFD700', hdr: '#FF1493', title: 'WHO TOOK THE CROWN?',   sub: 'COVER PERFORMER', artist: 'BIG ACE',     tag: 'HIP-HOP · 4,812 VOTES',      cta: 'CYPHER OPEN',       c1: '#00BFFF' },
                { bg: '#FF1493', hdr: '#000000', title: 'BATTLE NIGHT CHAMPION',  sub: 'REIGNING CHAMP',  artist: 'WAVETEK',     tag: '47 WINS · HIP-HOP',          cta: '⚔️ CHALLENGE 8PM',  c1: '#FFD700' },
                { bg: '#00BFFF', hdr: '#000000', title: "WHO'S GOT THE BARS?",    sub: 'ON THE MIC NOW',  artist: 'NOVA CIPHER', tag: 'CYPHER OPEN · 841 WATCHING',  cta: 'DROP IN ANYTIME',   c1: '#FF1493' },
                { bg: '#000000', hdr: '#FFD700', title: 'CHALLENGE THE CROWN',    sub: 'DEFENDING NOW',   artist: 'BEAT THE BEAT',tag:'WAVETEK · 841 VOTES',         cta: 'ARENA SEATS 18,500',c1: '#FF1493' },
                { bg: '#9B59B6', hdr: '#FFD700', title: 'DJ BATTLE NIGHT',        sub: 'CURRENT #1 DJ',   artist: 'DJ KRAZE',    tag: 'DJ · TURNTABLIST',            cta: 'JOIN BATTLE QUEUE', c1: '#00BFFF' },
              ].map((p, i) => (
                <div key={`${rep}-${i}`} style={{ display: 'inline-flex', flexDirection: 'column', width: 190, flexShrink: 0, border: '3px solid #000', overflow: 'hidden', background: p.bg, height: '100%' }}>
                  <div style={{ background: p.hdr, padding: '6px 8px' }}>
                    <div style={{ fontSize: 6, fontWeight: 700, color: p.hdr === '#000000' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.06em' }}>THE MUSICIAN&apos;S INDEX · VOL.1 · $4.99</div>
                  </div>
                  <div style={{ padding: '10px 8px', flex: 1 }}>
                    <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 22, color: p.hdr === '#000000' ? (p.bg === '#000000' ? '#FFD700' : '#FFD700') : '#000', lineHeight: 1, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ background: p.c1, padding: '4px 6px', marginBottom: 3 }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: '#000' }}>{p.sub}</div>
                      <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 14, color: '#000' }}>{p.artist}</div>
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>{p.tag}</div>
                  </div>
                  <div style={{ background: '#000', padding: '4px 8px', fontSize: 7, fontWeight: 700, color: p.hdr === '#000000' ? p.c1 : '#FFD700', letterSpacing: '0.05em' }}>{p.cta}</div>
                </div>
              ))
            )}
          </div>
          {/* Radial vignette keeps center readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at center, transparent 35%, rgba(6,2,26,0.88) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,2,26,0.9) 0%, transparent 22%, transparent 78%, rgba(6,2,26,0.9) 100%)', pointerEvents: 'none' }} />
        </div>

        {/* ── Underlay direction toggle ── */}
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={() => setUnderlayDir('left')} style={{ background: underlayDir === 'left' ? 'rgba(255,215,0,0.8)' : 'rgba(255,215,0,0.15)', color: underlayDir === 'left' ? '#000' : '#FFD700', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 4, fontSize: 7, fontWeight: 800, padding: '2px 7px', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif" }}>◀ TABLOID</button>
          <button onClick={() => setUnderlayDir('right')} style={{ background: underlayDir === 'right' ? 'rgba(255,215,0,0.8)' : 'rgba(255,215,0,0.15)', color: underlayDir === 'right' ? '#000' : '#FFD700', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 4, fontSize: 7, fontWeight: 800, padding: '2px 7px', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif" }}>TABLOID ▶</button>
        </div>

        {/* ── Cinematic 3-Rail Grid — LEFT PANEL | ORBITAL | RIGHT PANEL ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'clamp(120px, 15vw, 170px) 1fr clamp(120px, 15vw, 170px)',
            width: '100%',
            alignItems: 'start',
            gap: 10,
            padding: '0 10px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* ════ LEFT PANEL — PROMO/VENUE/ADS tabs + collapse ════ */}
          <div style={{ display: 'flex', alignItems: 'stretch', paddingTop: 8 }}>
            <div style={{ width: leftOpen ? 'clamp(120px,15vw,160px)' : 0, overflow: 'hidden', transition: 'width 0.3s ease', flexShrink: 0 }}>
              <div style={{ background: 'rgba(6,2,26,0.95)', border: '1px solid rgba(255,45,170,0.35)', borderRadius: '8px 0 0 8px', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', gap: 2, padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {(['PROMO','VENUE','ADS'] as const).map((label, i) => (
                    <button key={label} onClick={() => setLeftTab(i)} style={{ flex: 1, fontSize: 7, fontWeight: 800, cursor: 'pointer', borderRadius: 4, padding: '3px 4px', border: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', background: leftTab === i ? 'rgba(255,45,170,0.25)' : 'rgba(255,255,255,0.06)', color: leftTab === i ? '#FF2DAA' : 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>{label}</button>
                  ))}
                </div>
                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 6px', fontSize: 9 }}>
                  {leftTab === 0 && (
                    <>
                      <div style={{ fontSize: 7, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.12em', marginBottom: 6 }}>⭐ FREE PROMO SLOTS</div>
                      {getFeaturedFreePerformers(3).map((p) => {
                        const pColor = '#FF2DAA';
                        return (
                          <Link key={p.slug} href={`/performers/${p.slug}`} style={{ textDecoration: 'none' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,45,170,0.2)', borderRadius: 5, padding: 5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                              {p.profileImageUrl && <img src={p.profileImageUrl} alt={p.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${pColor}44`, flexShrink: 0 }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                <div style={{ fontSize: 7, color: '#00FF88' }}>▲ {(p.fanCount ?? p.score ?? 0).toLocaleString()}</div>
                              </div>
                              <span style={{ fontSize: 6, fontWeight: 700, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.5)', borderRadius: 3, padding: '1px 4px' }}>BOOST</span>
                            </div>
                          </Link>
                        );
                      })}
                      <Link href="/sponsors/claim-slot" style={{ textDecoration: 'none' }}>
                        <div style={{ border: '1px dashed rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.04)', borderRadius: 5, padding: '6px', textAlign: 'center', cursor: 'pointer', marginTop: 2 }}>
                          <div style={{ fontSize: 14, marginBottom: 1 }}>+</div>
                          <div style={{ fontSize: 7, color: '#FFD700', fontWeight: 700 }}>Claim Free Slot</div>
                        </div>
                      </Link>
                    </>
                  )}
                  {leftTab === 1 && (
                    <>
                      <div style={{ fontSize: 7, fontWeight: 800, color: '#FF8C00', letterSpacing: '0.12em', marginBottom: 6 }}>🏟 VENUE BOOKING</div>
                      {venues.map((v, i) => (
                        <div key={v.day} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.18)', borderRadius: 5, padding: '5px 6px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 8, fontWeight: 700, color: '#FF8C00' }}>{v.day} · {v.venue}</div>
                          </div>
                          <Link href={v.bookRoute} style={{ textDecoration: 'none' }}>
                            <span style={{ fontSize: 6, fontWeight: 700, color: '#00FF88', border: '1px solid rgba(0,255,136,0.4)', borderRadius: 3, padding: '1px 5px', cursor: 'pointer' }}>BOOK</span>
                          </Link>
                        </div>
                      ))}
                      <Link href="/venues" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', background: '#FF8C00', color: '#000', fontSize: 7, fontWeight: 800, border: 'none', borderRadius: 4, padding: '5px', cursor: 'pointer', marginTop: 3, letterSpacing: '0.06em' }}>Browse Dates</button>
                      </Link>
                    </>
                  )}
                  {leftTab === 2 && (
                    <AdSenseSlot slot={AD_SLOTS.homepageMid} format="auto" style={{ minHeight: 200 }} />
                  )}
                </div>
              </div>
            </div>
            {/* Collapse toggle strip */}
            <div onClick={() => setLeftOpen(!leftOpen)} style={{ background: 'rgba(255,45,170,0.18)', border: '1px solid rgba(255,45,170,0.4)', borderRadius: leftOpen ? '0 5px 5px 0' : '5px', width: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: 7, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.1em', userSelect: 'none', flexShrink: 0 }}>
              {leftOpen ? '◂ PANEL' : 'PANEL ▸'}
            </div>
          </div>
          
          {/* ── WEEKLY CROWN ORBIT label ── */}
          <div style={{ textAlign: 'center', padding: '8px 0 4px', position: 'relative', zIndex: 5 }}>
            <div style={{ fontFamily: "'Orbitron','Inter',sans-serif", fontSize: 13, fontWeight: 900, color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,0.6)', letterSpacing: '0.08em' }}>WEEKLY CROWN ORBIT</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginTop: 1 }}>TOP RANKED · LIVE NOW · REAL TIME</div>
          </div>

          {/* ── Orbital ring ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minWidth: 'min(300px, 92vw)',
              maxWidth: '700px',
              aspectRatio: '1 / 1',
              margin: '0 auto',
              flexShrink: 0,
            }}
          >
          {/* Starburst transition overlay */}
          {starburst && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', overflow: 'hidden' }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: 4,
                  height: '55%',
                  background: `linear-gradient(to top, ${accentColor}, transparent)`,
                  transformOrigin: 'bottom center',
                  transform: `rotate(${i * (360 / 14)}deg) translateX(-50%)`,
                  animation: 'h1StarburstRay 0.8s ease-out forwards',
                  animationDelay: `${i * 0.02}s`,
                }} />
              ))}
            </div>
          )}

          {/* Spinning ring */}
          <div
            style={{
              position: 'absolute',
              inset: '5%',
              borderRadius: '50%',
              border: `1px solid ${accentColor}22`,
              boxShadow: `0 0 40px ${accentColor}18`,
              transform: `rotate(${orbitDeg}deg)`,
              transition: 'transform 0.016s linear',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '8%',
              borderRadius: '50%',
              border: `1px dashed ${accentColor}14`,
              transform: `rotate(${-orbitDeg * 0.6}deg)`,
              transition: 'transform 0.016s linear',
            }}
          />

          {/* Center: Crown holder — LIVE routes to seat-join flow, else → profile */}
          <Link
            href={crowdHolder.isLive && crowdHolder.liveRoomRoute ? `${crowdHolder.liveRoomRoute}?from=home-1` : crowdHolder.profileRoute}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textDecoration: 'none',
              zIndex: 20,
            }}
            onClick={crowdHolder.isLive && crowdHolder.liveRoomRoute ? (e: React.MouseEvent) => {
              e.preventDefault();
              setPendingOrbit({
                id: crowdHolder.slug,
                title: `${crowdHolder.name} — LIVE`,
                viewers: crowdHolder.audienceCount ?? 0,
                status: 'live',
                access: 'free',
                accentColor: '#E63000',
                roomRoute: `${crowdHolder.liveRoomRoute}?from=home-1`,
                venueIndex: 1,
                shape: 'circle',
              });
            } : undefined}
          >
            <div
              style={{
                width: 'min(130px, 22vw)',
                height: 'min(130px, 22vw)',
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${accentColor}55, ${bgColor})`,
                border: `3px solid ${accentColor}`,
                boxShadow: `0 0 40px ${accentColor}66, inset 0 0 20px ${accentColor}22`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'h1Pulse 2.5s ease-in-out infinite',
                cursor: 'pointer',
              }}
            >
              {/* Crown above */}
              <div
                style={{
                  fontSize: 'min(28px, 5vw)',
                  animation: 'h1CrownFloat 3s ease-in-out infinite',
                  marginBottom: 2,
                  filter: `drop-shadow(0 0 8px #FFD700)`,
                }}
              >
                👑
              </div>
              {/* Rule 2: Crown holder — LIVE VIDEO → MOTION POSTER → STATIC */}
              <MotionPosterPlayer
                isLive={crowdHolder.isLive}
                liveRoomRoute={crowdHolder.liveRoomRoute}
                introVideoUrl={crowdHolder.introVideoUrl}
                motionPosterUrl={crowdHolder.motionPosterUrl}
                staticImageUrl={crowdHolder.profileImageUrl}
                alt={crowdHolder.name}
                audienceCount={crowdHolder.audienceCount}
                showLiveOverlay={false}
                replayOnHover
                style={{
                  width: 'min(50px, 9vw)',
                  height: 'min(50px, 9vw)',
                  borderRadius: '50%',
                  border: `2px solid ${accentColor}`,
                  marginBottom: 4,
                  flexShrink: 0,
                }}
              />
              <div style={{
                fontSize: 'min(9px, 1.8vw)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.05em',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                marginTop: 2,
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {crowdHolder.name}
              </div>
              <div style={{
                fontSize: 'min(8px, 1.5vw)',
                fontWeight: 700,
                color: '#FFD700',
                fontFamily: "'Inter', sans-serif",
              }}>
                #1 {genreKey}
              </div>
            </div>
          </Link>

          {/* 10 orbit cards — live → seat-join flow; not live → performer profile */}
          {performers.map((p, i) => {
            const pos = getOrbitPos(i, 10, 44);
            const cardSize = i === 0 ? 80 : 68;
            return (
              <Link
                key={p.slug}
                href={p.isLive && p.liveRoomRoute ? `${p.liveRoomRoute}?from=home-1` : `/performers/${p.slug}`}
                style={{ textDecoration: 'none' }}
                onClick={p.isLive && p.liveRoomRoute ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  setPendingOrbit({
                    id: p.slug,
                    title: `${p.name} LIVE`,
                    viewers: 0,
                    status: 'live',
                    access: 'free',
                    accentColor: accentColor,
                    roomRoute: `${p.liveRoomRoute}?from=home-1`,
                    venueIndex: 1,
                    shape: 'oct',
                  });
                } : undefined}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: activeIdx === i ? 30 : 10,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                >
                  {/* Rank badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: -4,
                      zIndex: 5,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background:
                        p.rank === 1
                          ? 'linear-gradient(135deg, #FFD700, #FF9500)'
                          : `${accentColor}33`,
                      border: `1.5px solid ${p.rank === 1 ? '#FFD700' : accentColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 8,
                      fontWeight: 900,
                      color: p.rank === 1 ? '#050510' : accentColor,
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: `0 0 8px ${p.rank === 1 ? '#FFD700' : accentColor}66`,
                    }}
                  >
                    {p.rank}
                  </div>

                  {/* P7: 4:5 portrait card */}
                  <div
                    style={{
                      width: cardSize,
                      height: Math.round(cardSize * 1.28),
                      borderRadius: 5,
                      background: `linear-gradient(160deg, ${accentColor}28, ${bgColor})`,
                      border: `2px solid ${accentColor}${activeIdx === i ? 'cc' : '55'}`,
                      boxShadow: activeIdx === i ? `0 0 24px ${accentColor}88` : `0 0 8px ${accentColor}22`,
                      transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                      transform: activeIdx === i ? 'scale(1.12)' : 'scale(1)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      position: 'relative',
                    }}
                  >
                    {/* Live dot — top-right for top 3 */}
                    {p.rank <= 3 && (
                      <div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#E63000', boxShadow: '0 0 5px #E63000', animation: 'h1Pulse 1.5s infinite' }} />
                    )}
                    {/* Performer Avatar — motion poster freeze frame if available, else profile image */}
                    <img
                      src={p.image ?? `https://i.pravatar.cc/150?u=${p.slug}`}
                      alt={p.name}
                      style={{
                        width: cardSize * 0.45, height: cardSize * 0.45, borderRadius: '50%',
                        objectFit: 'cover', marginBottom: 4, border: `1px solid ${accentColor}55`, zIndex: 1
                      }}
                    />
                    {/* Name */}
                    <div style={{ fontSize: Math.max(cardSize * 0.1, 7), fontWeight: 900, color: '#fff', textAlign: 'center', fontFamily: "'Inter',sans-serif", maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name.split(' ')[0]}
                    </div>
                    {/* Genre pill */}
                    <div style={{ fontSize: Math.max(cardSize * 0.08, 6), color: accentColor, background: `${accentColor}18`, borderRadius: 8, padding: '1px 4px', fontFamily: "'Inter',sans-serif" }}>
                      {p.genre}
                    </div>
                    {/* Audience count */}
                    <div style={{ fontSize: Math.max(cardSize * 0.08, 6), color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter',sans-serif" }}>
                      👁 {(Math.round(p.score / 10) * 10).toLocaleString()}
                    </div>
                  </div>

                  {/* Hover tooltip */}
                  {activeIdx === i && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -36,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(10,6,20,0.95)',
                        border: `1px solid ${accentColor}55`,
                        borderRadius: 8,
                        padding: '5px 10px',
                        whiteSpace: 'nowrap',
                        zIndex: 50,
                        animation: 'h1StickerPop 0.25s ease',
                      }}
                    >
                      <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, fontFamily: "'Inter', sans-serif" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
                        #{p.rank} · {p.score.toLocaleString()} pts → Read Article
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Sticker overlays */}
          <div
            style={{
              position: 'absolute',
              top: '8%',
              left: '-4%',
              background: `linear-gradient(135deg, ${accentColor}, #FFD700)`,
              color: '#050510',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.1em',
              fontFamily: "'Inter', sans-serif",
              transform: 'rotate(-8deg)',
              boxShadow: `0 4px 20px ${accentColor}55`,
              animation: 'h1StickerPop 0.4s ease',
              zIndex: 40,
              whiteSpace: 'nowrap',
            }}
          >
            {genre.emoji} {genreKey} GENRE BATTLE!
          </div>

          <Link href="/live/rooms/cypher-arena" style={{ textDecoration: 'none' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '12%',
                right: '-2%',
                background: 'linear-gradient(135deg, #AA2DFF, #FF2DAA)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.08em',
                fontFamily: "'Inter', sans-serif",
                transform: 'rotate(5deg)',
                boxShadow: '0 4px 20px rgba(170,45,255,0.5)',
                animation: 'h1StickerPop 0.5s ease',
                zIndex: 40,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🔘 CYPHER ARENA OPEN
            </div>
          </Link>

          <Link href="/rankings/vote" style={{ textDecoration: 'none' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '22%',
                left: '-2%',
                background: 'rgba(20,10,40,0.92)',
                border: '2px solid #FFD700',
                color: '#FFD700',
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.06em',
                fontFamily: "'Inter', sans-serif",
                transform: 'rotate(-4deg)',
                boxShadow: '0 4px 16px rgba(255,215,0,0.3)',
                zIndex: 40,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🗳️ VOTING OPEN: VOTE FOR #4!
            </div>
          </Link>

          {/* ── BACK / NEXT orbit navigation ── */}
          <div style={{ position: 'absolute', left: 0, bottom: 8, zIndex: 45 }}>
            <button
              onClick={() => setActiveIdx((prev) => ((prev ?? 0) - 1 + performers.length) % performers.length)}
              style={{ background: 'rgba(10,6,20,0.85)', border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 9, fontWeight: 900, padding: '4px 9px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}
            >
              ◀ BACK
            </button>
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: 8, zIndex: 45 }}>
            <button
              onClick={() => setActiveIdx((prev) => ((prev ?? 0) + 1) % performers.length)}
              style={{ background: 'rgba(10,6,20,0.85)', border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 9, fontWeight: 900, padding: '4px 9px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}
            >
              NEXT ▶
            </button>
          </div>
        </div>
        
          {/* ════ RIGHT PANEL — RANKS/ADS/PROMO tabs + collapse ════ */}
          <div style={{ display: 'flex', alignItems: 'stretch', paddingTop: 8 }}>
            {/* Collapse toggle strip */}
            <div onClick={() => setRightOpen(!rightOpen)} style={{ background: 'rgba(255,215,0,0.18)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: rightOpen ? '5px 0 0 5px' : '5px', width: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: 7, fontWeight: 800, color: '#FFD700', letterSpacing: '0.1em', userSelect: 'none', flexShrink: 0, transform: 'rotate(180deg)' }}>
              {rightOpen ? '◂ PANEL' : 'PANEL ▸'}
            </div>
            <div style={{ width: rightOpen ? 'clamp(120px,15vw,160px)' : 0, overflow: 'hidden', transition: 'width 0.3s ease', flexShrink: 0 }}>
              <div style={{ background: 'rgba(6,2,26,0.95)', border: '1px solid rgba(255,215,0,0.35)', borderRadius: '0 8px 8px 0', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', gap: 2, padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {(['RANKS','ADS','PROMO'] as const).map((label, i) => (
                    <button key={label} onClick={() => setRightTab(i)} style={{ flex: 1, fontSize: 7, fontWeight: 800, cursor: 'pointer', borderRadius: 4, padding: '3px 4px', border: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', background: rightTab === i ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)', color: rightTab === i ? '#FFD700' : 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>{label}</button>
                  ))}
                </div>
                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 6px', fontSize: 9 }}>
                  {rightTab === 0 && (
                    <>
                      <div style={{ fontSize: 7, fontWeight: 800, color: '#FFD700', letterSpacing: '0.12em', marginBottom: 6 }}>👑 LIVE RANKINGS</div>
                      {performers.slice(0, 8).map((p, i) => (
                        <Link key={p.slug} href={`/articles/performer/${p.slug}`} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: i === 0 ? 'rgba(255,45,170,0.18)' : 'rgba(255,215,0,0.12)', border: `1px solid ${i === 0 ? 'rgba(255,45,170,0.4)' : 'rgba(255,215,0,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0 }}>{p.emoji}</div>
                            <span style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: 8, minWidth: 14 }}>{i + 1}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 8, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.35)' }}>{p.genre}</div>
                            </div>
                            {i < 3 && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E63000', boxShadow: '0 0 4px #E63000', animation: 'h1Pulse 1s infinite', flexShrink: 0 }} />}
                          </div>
                        </Link>
                      ))}
                      <Link href="/rankings" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 4, fontSize: 7, fontWeight: 700, padding: '4px', cursor: 'pointer', marginTop: 5, letterSpacing: '0.06em' }}>Full Leaderboard →</button>
                      </Link>
                    </>
                  )}
                  {rightTab === 1 && (
                    <AdSenseSlot slot={AD_SLOTS.homepageMid} format="auto" style={{ minHeight: 200 }} />
                  )}
                  {rightTab === 2 && (
                    <>
                      <div style={{ fontSize: 7, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.12em', marginBottom: 6 }}>📢 PROMO SPOTS</div>
                      {[
                        { name: 'Cypher Arena', viewers: '841', color: '#00E5FF', href: '/live/rooms/cypher-arena' },
                        { name: 'Battle Stage', viewers: '2,130', color: '#FF2DAA', href: '/live/rooms/battle-stage' },
                        { name: 'Stream & Win', viewers: '3,412', color: '#FFD700', href: '/live/lobby?filter=stream-win' },
                        { name: 'Monday Stage', viewers: '412', color: '#00FF7F', href: '/games/monday-night' },
                      ].map((item) => (
                        <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, boxShadow: `0 0 4px ${item.color}`, flexShrink: 0 }} />
                              <span style={{ fontSize: 8, color: '#fff' }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>{item.viewers}</span>
                          </div>
                        </Link>
                      ))}
                      <Link href="/sponsors/advertise" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', marginTop: 8, padding: '5px', fontSize: 7, fontWeight: 700, border: '1px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.08)', color: '#FFD700', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.06em' }}>GET STARTED</button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div> {/* End Cinematic 3-Rail Grid */}
        </div> {/* End orbital section wrapper */}

        {/* ══ MOVING RAIL #2 — scrolls RIGHT (opposite direction), rainbow animated bg ══ */}
        <div style={{ width: '100%', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF,#00E5FF,#FFD700,#FF2DAA)', backgroundSize: '400% 100%', animation: 'h1ColorBg 8s ease infinite', overflow: 'hidden', height: 24, position: 'relative', borderTop: '1px solid rgba(255,255,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'inline-block', whiteSpace: 'nowrap', animation: 'h1RailRight 20s linear infinite' }}>
            {['★ BREAKING: CROWN UPDATE — SEE WHO LEADS', '▶ LATEST BATTLES TONIGHT — TUNE IN NOW', '◆ MUSIC NEWS LIVE — WAVETEK DEFENDS', '● TMI MAGAZINE ISSUE 1 OUT NOW', '◉ BEAT MARKETPLACE OPEN — BUY/SELL BEATS', '▷ WORLD PREMIERE DROPPING TONIGHT AT MIDNIGHT', '◈ CYPHER CHAMPIONS — FINALS THIS SATURDAY', '◆ SPONSOR SPOTLIGHT — BEATS BY TMX ON TMI', '★ NEW ARTISTS JOINING — DISCOVERY CHARTS LIVE', '▶ AUDITIONS OPEN — ALL GENRES ACCEPTED'].map((msg, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 700, color: '#fff', padding: '0 24px', lineHeight: '24px', whiteSpace: 'nowrap' }}>{msg}</span>
            ))}
            {['★ BREAKING: CROWN UPDATE — SEE WHO LEADS', '▶ LATEST BATTLES TONIGHT — TUNE IN NOW', '◆ MUSIC NEWS LIVE — WAVETEK DEFENDS', '● TMI MAGAZINE ISSUE 1 OUT NOW', '◉ BEAT MARKETPLACE OPEN — BUY/SELL BEATS', '▷ WORLD PREMIERE DROPPING TONIGHT AT MIDNIGHT', '◈ CYPHER CHAMPIONS — FINALS THIS SATURDAY', '◆ SPONSOR SPOTLIGHT — BEATS BY TMX ON TMI', '★ NEW ARTISTS JOINING — DISCOVERY CHARTS LIVE', '▶ AUDITIONS OPEN — ALL GENRES ACCEPTED'].map((msg, i) => (
              <span key={`d-${i}`} style={{ fontSize: 9, fontWeight: 700, color: '#fff', padding: '0 24px', lineHeight: '24px', whiteSpace: 'nowrap' }}>{msg}</span>
            ))}
          </div>
        </div>

        {/* ── P6: Three independent video monitors (9500 / 13200 / 17000 ms, 2300ms stagger) ── */}
        <div style={{ width: '100%', maxWidth: 900, padding: '12px 10px 0', display: 'flex', gap: 10 }}>
          <PerformerMonitor performers={performers} offsetIdx={0} intervalMs={9500}  accentColor={accentColor} delayMs={0}    channelNum={1} />
          <PerformerMonitor performers={performers} offsetIdx={3} intervalMs={13200} accentColor={accentColor} delayMs={2300} channelNum={2} />
          <PerformerMonitor performers={performers} offsetIdx={6} intervalMs={17000} accentColor={accentColor} delayMs={4600} channelNum={3} />
        </div>

        {/* ── Sponsor Ad Rail — Paid → Internal Promo → Advertise CTA ── */}
        {(() => {
          const INTERNAL_PROMOS = [
            { label: '🎵 Beat Marketplace', href: '/beats', color: '#FFD700' },
            { label: '🎙 Submit Your Track', href: '/upload', color: '#00E5FF' },
            { label: '🏆 Join This Week\'s Battle', href: '/battles', color: '#AA2DFF' },
          ] as const;
          const slots = [0, 1, 2].map((i) => {
            const paid = getActiveSponsorForZone(`home-1-sponsorRail-${i}`);
            if (paid) return { label: paid.name, href: paid.ctaHref, cta: paid.ctaLabel, color: paid.accentColor, isPaid: true };
            const promo = INTERNAL_PROMOS[i]!;
            return { label: promo.label, href: promo.href, cta: i === 2 ? '→' : 'VIEW', color: promo.color, isPaid: false };
          });
          const advertiseSlot = getActiveSponsorForZone('home-1-sponsorRail-2') ? null : { label: '📢 ADVERTISE FROM $25', href: '/sponsors/advertise', cta: '→', color: '#FF2DAA' };
          const displaySlots = advertiseSlot ? [...slots.slice(0, 2), advertiseSlot] : slots;
          return (
            <div style={{ width: '100%', maxWidth: 900, padding: '8px 10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {displaySlots.map((slot, i) => (
                <div key={i} style={{ background: `rgba(${slot.color === '#FFD700' ? '255,215,0' : slot.color === '#00E5FF' ? '0,229,255' : slot.color === '#AA2DFF' ? '170,45,255' : '255,45,170'},0.06)`, border: `1px solid ${slot.color}33`, borderRadius: 5, padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 4 }}>{slot.label}</span>
                  <Link href={slot.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <button style={{ background: `${slot.color}22`, color: slot.color, border: `1px solid ${slot.color}44`, borderRadius: 3, fontSize: 7, padding: '2px 6px', cursor: 'pointer', fontWeight: 700 }}>{slot.cta}</button>
                  </Link>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Genre navigation dots ── */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0 20px',
          }}
        >
          {GENRE_KEYS.map((g, i) => {
            const gd = GENRE_DATA[g]!;
            const active = i === genreIdx % GENRE_KEYS.length;
            return (
              <button
                key={g}
                onClick={() => setGenreIdx(i)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: `1.5px solid ${active ? gd.color : gd.color + '44'}`,
                  background: active ? `${gd.color}22` : 'transparent',
                  color: active ? gd.color : `${gd.color}88`,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease',
                  boxShadow: active ? `0 0 10px ${gd.color}44` : 'none',
                }}
              >
                {gd.emoji} {g.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* ── Tabloid ticker — horizontal LEFT-scroll chyron ── */}
        <div
          style={{
            width: '100%',
            background: `linear-gradient(90deg, #1a0050, ${accentColor}22, #1a0050)`,
            borderTop: `1px solid ${accentColor}33`,
            borderBottom: `1px solid ${accentColor}33`,
            padding: '6px 0',
            marginTop: 16,
            overflow: 'hidden',
            height: 30,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              fontSize: 10,
              fontWeight: 900,
              color: accentColor,
              letterSpacing: '0.15em',
              fontFamily: "'Inter', sans-serif",
              animation: 'h1TickerScroll 45s linear infinite',
            }}
          >
            {TICKER_MSGS.map((msg, i) => (
              <span key={i} style={{ marginRight: '4em' }}>{msg}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {TICKER_MSGS.map((msg, i) => (
              <span key={`d-${i}`} style={{ marginRight: '4em' }}>{msg}</span>
            ))}
          </div>
        </div>

        {/* ── All performers grid (10 cards) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: 900,
            padding: '20px 16px 8px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em',
              fontFamily: "'Inter', sans-serif",
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            {genre.emoji} Top 10 — {genreKey} · Click any card to read their article
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 10,
            }}
          >
            {performers.map((p, i) => (
              <Link
                key={p.slug}
                href={`/articles/performer/${p.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}18, rgba(10,6,20,0.8))`,
                    border: `1px solid ${accentColor}${i === 0 ? '88' : '33'}`,
                    borderRadius: 10,
                    padding: '10px 10px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = accentColor;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 20px ${accentColor}44`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}${i === 0 ? '88' : '33'}`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 8,
                      fontSize: 16,
                      fontWeight: 900,
                      color: i === 0 ? '#FFD700' : `${accentColor}88`,
                      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    #{p.rank}
                  </div>

                  <div style={{ fontSize: 26, marginBottom: 4 }}>{p.emoji}</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-0.01em',
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: 2,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 8,
                      color: accentColor,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.06em',
                    }}
                  >
                    {p.score.toLocaleString()} pts
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 8,
                      color: 'rgba(255,255,255,0.35)',
                      fontFamily: "'Inter', sans-serif",
                      borderTop: `1px solid ${accentColor}22`,
                      paddingTop: 5,
                    }}
                  >
                    Read Article →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA strip ── */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '16px 16px 0',
          }}
        >
          {[
            { label: '🎤 JOIN AS ARTIST', href: '/signup?role=artist', bg: accentColor, color: '#050510' },
            { label: '⚔️ BATTLE TONIGHT', href: '/battles', bg: '#FF2DAA', color: '#fff' },
            { label: '📰 READ THE INDEX', href: '/magazine', bg: 'transparent', color: '#FFD700', border: '#FFD700' },
            { label: '👀 FAN MODE', href: '/signup?role=fan', bg: 'transparent', color: '#00FF88', border: '#00FF88' },
          ].map((btn) => (
            <Link
              key={btn.label}
              href={btn.href}
              style={{
                padding: '10px 20px',
                background: btn.bg || 'transparent',
                border: `2px solid ${btn.border || btn.bg}`,
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 900,
                color: btn.color,
                textDecoration: 'none',
                letterSpacing: '0.08em',
                fontFamily: "'Inter', sans-serif",
                boxShadow: btn.bg !== 'transparent' ? `0 0 16px ${btn.bg}55` : 'none',
              }}
            >
              {btn.label}
            </Link>
          ))}
        </div>

        {/* ── Weekly Cyphers bottom bar ── */}
        <Link
          href="/articles?category=cypher"
          style={{
            display: 'block',
            width: '100%',
            marginTop: 24,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, #2D0D6E, #1a0050, #2D0D6E)`,
              borderTop: `2px solid ${accentColor}`,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>⚡</span>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'clamp(18px, 4vw, 26px)',
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  color: '#FFD700',
                  letterSpacing: '0.04em',
                }}
              >
                Weekly Cyphers!
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.06em',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Who took the crown this week? → Read all articles
              </div>
            </div>
            <span style={{ fontSize: 18 }}>⚡</span>
          </div>
        </Link>

        {/* ══ NEWS BELT + INTERVIEWS — 2-column section ══ */}
        <div style={{ width: '100%', maxWidth: 900, padding: '16px 10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Left: News Belt */}
          <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#FFD700', letterSpacing: '0.18em', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>◆ NEWS BELT</div>
            {[
              { text: 'WAVETEK DEFENDS CROWN IN OVERTIME BATTLE — 3RD TITLE', href: '/battles' },
              { text: 'CYPHER ARENA RECORD BROKEN — 24 BARS NON-STOP', href: '/battles/cypher' },
              { text: 'MAGAZINE ISSUE 2 DROPS FRIDAY — COVER REVEAL', href: '/magazine' },
              { text: 'BEAT MARKETPLACE PASSES 500 TRACKS — BROWSE NOW', href: '/beats' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, borderLeft: '2px solid rgba(255,215,0,0.3)', paddingLeft: 6, fontFamily: "'Inter',sans-serif" }}>
                  {item.text}
                </div>
              </Link>
            ))}
          </div>
          {/* Right: Interviews */}
          <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#00E5FF', letterSpacing: '0.18em', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>🎙 INTERVIEWS</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: "'Inter',sans-serif" }}>WAVETEK</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 3, fontFamily: "'Inter',sans-serif" }}>
                &ldquo;I came to TMI with 3 songs. Now I have 3 titles. The crowd here doesn&apos;t play. You gotta be ready every night.&rdquo;
              </div>
              <Link href="/articles/performer/wavetek" style={{ textDecoration: 'none' }}><div style={{ fontSize: 7, color: '#00E5FF', marginTop: 4, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>READ FULL INTERVIEW →</div></Link>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: "'Inter',sans-serif" }}>DJ RECKLESS</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 3, fontFamily: "'Inter',sans-serif" }}>
                &ldquo;The vibe at TMI is different. Sponsors, live crowds, and real money. This is the future of music.&rdquo;
              </div>
              <Link href="/articles/performer/dj-reckless" style={{ textDecoration: 'none' }}><div style={{ fontSize: 7, color: '#00E5FF', marginTop: 4, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>READ FULL INTERVIEW →</div></Link>
            </div>
          </div>
        </div>

        {/* ══ BIG CTA BUTTONS — 7 full-width ══ */}
        <div style={{ width: '100%', maxWidth: 900, padding: '14px 10px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { label: '🎤 JOIN TMI', href: '/signup', bg: 'rgba(255,45,170,0.18)', color: '#FF2DAA', border: 'rgba(255,45,170,0.5)' },
            { label: '📰 READ MAGAZINE', href: '/magazine', bg: 'rgba(255,215,0,0.12)', color: '#FFD700', border: 'rgba(255,215,0,0.4)' },
            { label: '⚡ VOTE LIVE', href: '/battles', bg: 'rgba(230,48,0,0.15)', color: '#E63000', border: 'rgba(230,48,0,0.4)' },
            { label: '🥊 JOIN BATTLE', href: '/battles/challenge', bg: 'rgba(170,45,255,0.15)', color: '#AA2DFF', border: 'rgba(170,45,255,0.4)' },
            { label: '🎭 SEE ROOMS', href: '/live/lobby', bg: 'rgba(0,229,255,0.1)', color: '#00E5FF', border: 'rgba(0,229,255,0.35)' },
            { label: '🔥 CYPHER', href: '/battles/cypher', bg: 'rgba(0,255,127,0.1)', color: '#00FF7F', border: 'rgba(0,255,127,0.35)' },
            { label: '💰 SPONSOR', href: '/sponsors', bg: 'rgba(255,215,0,0.08)', color: '#FFD700', border: 'rgba(255,215,0,0.3)' },
          ].map((btn) => (
            <Link key={btn.label} href={btn.href} style={{ textDecoration: 'none', gridColumn: btn.label.includes('CYPHER') ? 'span 1' : undefined }}>
              <div style={{ background: btn.bg, border: `1px solid ${btn.border}`, borderRadius: 6, padding: '8px 4px', textAlign: 'center', fontSize: 8, fontWeight: 800, color: btn.color, letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif", cursor: 'pointer' }}>
                {btn.label}
              </div>
            </Link>
          ))}
        </div>

        {/* ══ LIVE STATS BAR — ticking counters ══ */}
        <div style={{ width: '100%', maxWidth: 900, padding: '10px 10px 0', display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {[
            { label: 'LIVE VENUES', value: venues.length, color: '#00E5FF', icon: '🏟' },
            { label: 'WATCHING', value: (voteCount * 8).toLocaleString(), color: '#FF2DAA', icon: '👁' },
            { label: 'TIPS SENT', value: `$${(voteCount * 0.5).toFixed(0)}`, color: '#FFD700', icon: '💰' },
            { label: 'VOTES CAST', value: voteCount.toLocaleString(), color: '#AA2DFF', icon: '⚡' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, background: `${stat.color}08`, border: `1px solid ${stat.color}25`, borderRadius: 5, padding: '6px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 13 }}>{stat.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: stat.color, fontFamily: "'Inter',sans-serif", lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif", marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ══ BOTTOM NAV BAR ══ */}
        <div style={{ width: '100%', marginTop: 20, background: 'rgba(6,2,26,0.96)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Link href="/login" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>SIGN IN</div></Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 800, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.4)', borderRadius: 4, padding: '3px 8px', letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif" }}>+ SUBMIT</div></Link>
          <Link href="/about/guide" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>OPEN GUIDE</div></Link>
          <Link href="/about/beta" style={{ textDecoration: 'none' }}><div style={{ fontSize: 9, fontWeight: 700, color: '#FFD700', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>BETA FEEDBACK</div></Link>
        </div>

      </div>
    </div>
    </>
  );
}
