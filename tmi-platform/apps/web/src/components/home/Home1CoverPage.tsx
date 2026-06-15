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

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Genre + performer data (10 per genre) ────────────────────────────────────

interface Performer {
  slug: string;
  name: string;
  emoji: string;
  rank: number;
  score: number;
  genre: string;
}

const GENRE_DATA: Record<string, { color: string; bg: string; emoji: string; performers: Performer[] }> = {
  'Hip-Hop': {
    color: '#FFD700',
    bg: '#2D1A00',
    emoji: '🎤',
    performers: [
      { slug: 'big-ace', name: 'Big Ace', emoji: '🎤', rank: 1, score: 9840, genre: 'Hip-Hop' },
      { slug: 'charro-ace', name: 'Charro Ace', emoji: '👑', rank: 2, score: 8910, genre: 'Hip-Hop' },
      { slug: 'flow-jamz', name: 'Flow Jamz', emoji: '🎶', rank: 3, score: 7830, genre: 'Hip-Hop' },
      { slug: 'yung-tuck', name: 'Yung Tuck', emoji: '🤙', rank: 4, score: 6720, genre: 'Hip-Hop' },
      { slug: 'urban-scholar', name: 'Urban Scholar', emoji: '📚', rank: 5, score: 5940, genre: 'Hip-Hop' },
      { slug: 'max-flare', name: 'Max Flare', emoji: '⚡', rank: 6, score: 4880, genre: 'Hip-Hop' },
      { slug: 'mc-nova', name: 'MC Nova', emoji: '🌟', rank: 7, score: 3760, genre: 'Hip-Hop' },
      { slug: 'leeze', name: 'Leeze', emoji: '🎯', rank: 8, score: 3120, genre: 'Hip-Hop' },
      { slug: 'retro-rick', name: 'Retro Rick', emoji: '🎸', rank: 9, score: 2480, genre: 'Hip-Hop' },
      { slug: 'trovor-rw', name: 'Trovor RW', emoji: '🔊', rank: 10, score: 1940, genre: 'Hip-Hop' },
    ],
  },
  'R&B': {
    color: '#FF2DAA',
    bg: '#2D001A',
    emoji: '🎵',
    performers: [
      { slug: 'lani-flame', name: 'Lani Flame', emoji: '🔥', rank: 1, score: 9210, genre: 'R&B' },
      { slug: 'mia-jay', name: 'Mia Jay', emoji: '💜', rank: 2, score: 8340, genre: 'R&B' },
      { slug: 'nova-sky', name: 'Nova Sky', emoji: '⭐', rank: 3, score: 7200, genre: 'R&B' },
      { slug: 'diana-electro', name: 'Diana E.', emoji: '💙', rank: 4, score: 6100, genre: 'R&B' },
      { slug: 'trina-sky', name: 'Trina Sky', emoji: '🌸', rank: 5, score: 5280, genre: 'R&B' },
      { slug: 'lucy-sky', name: 'Lucy Sky', emoji: '🎀', rank: 6, score: 4430, genre: 'R&B' },
      { slug: 'rosa-vibes', name: 'Rosa Vibes', emoji: '🌹', rank: 7, score: 3610, genre: 'R&B' },
      { slug: 'axalla-cosmo', name: 'Axalla Cosmo', emoji: '🌙', rank: 8, score: 2940, genre: 'R&B' },
      { slug: 'mona-chromatic', name: 'Mona Chroma', emoji: '🎭', rank: 9, score: 2240, genre: 'R&B' },
      { slug: 'lily88', name: 'Lily 88', emoji: '🌺', rank: 10, score: 1820, genre: 'R&B' },
    ],
  },
  'Gospel': {
    color: '#00FF88',
    bg: '#001A0D',
    emoji: '🙏',
    performers: [
      { slug: 'blessed-voice', name: 'Blessed Voice', emoji: '🙏', rank: 1, score: 8800, genre: 'Gospel' },
      { slug: 'grace-notes', name: 'Grace Notes', emoji: '🕊️', rank: 2, score: 7920, genre: 'Gospel' },
      { slug: 'light-bringer', name: 'Light Bringer', emoji: '✨', rank: 3, score: 6980, genre: 'Gospel' },
      { slug: 'choir-king', name: 'Choir King', emoji: '🎼', rank: 4, score: 5830, genre: 'Gospel' },
      { slug: 'spirit-wave', name: 'Spirit Wave', emoji: '🌊', rank: 5, score: 4760, genre: 'Gospel' },
      { slug: 'amen-flow', name: 'Amen Flow', emoji: '🌅', rank: 6, score: 3920, genre: 'Gospel' },
      { slug: 'holy-bars', name: 'Holy Bars', emoji: '📖', rank: 7, score: 3140, genre: 'Gospel' },
      { slug: 'faith-first', name: 'Faith First', emoji: '⛪', rank: 8, score: 2560, genre: 'Gospel' },
      { slug: 'heavenly-sound', name: 'Heavenly Sound', emoji: '🎷', rank: 9, score: 1990, genre: 'Gospel' },
      { slug: 'worship-wave', name: 'Worship Wave', emoji: '🎺', rank: 10, score: 1540, genre: 'Gospel' },
    ],
  },
  'Jazz': {
    color: '#AA2DFF',
    bg: '#1A001A',
    emoji: '🎷',
    performers: [
      { slug: 'global-vibes', name: 'Global Vibes', emoji: '🎷', rank: 1, score: 8400, genre: 'Jazz' },
      { slug: 'phat-bass', name: 'Phat Bass', emoji: '🎸', rank: 2, score: 7560, genre: 'Jazz' },
      { slug: 'midnight-groove', name: 'Midnight Groove', emoji: '🌑', rank: 3, score: 6620, genre: 'Jazz' },
      { slug: 'brass-king', name: 'Brass King', emoji: '🎺', rank: 4, score: 5480, genre: 'Jazz' },
      { slug: 'swing-city', name: 'Swing City', emoji: '🎻', rank: 5, score: 4340, genre: 'Jazz' },
      { slug: 'blue-notes', name: 'Blue Notes', emoji: '💙', rank: 6, score: 3510, genre: 'Jazz' },
      { slug: 'smooth-synth', name: 'Smooth Synth', emoji: '🎹', rank: 7, score: 2880, genre: 'Jazz' },
      { slug: 'bebop-jones', name: 'Bebop Jones', emoji: '🎵', rank: 8, score: 2210, genre: 'Jazz' },
      { slug: 'cool-cat', name: 'Cool Cat', emoji: '😎', rank: 9, score: 1760, genre: 'Jazz' },
      { slug: 'vibe-check', name: 'Vibe Check', emoji: '✅', rank: 10, score: 1340, genre: 'Jazz' },
    ],
  },
  'EDM': {
    color: '#00C8FF',
    bg: '#001A2D',
    emoji: '🎧',
    performers: [
      { slug: 'dj-blend', name: 'DJ Blend', emoji: '🎧', rank: 1, score: 9100, genre: 'EDM' },
      { slug: 'crystal-fizz', name: 'Crystal Fizz', emoji: '💎', rank: 2, score: 8080, genre: 'EDM' },
      { slug: 'neon-city', name: 'Neon City', emoji: '🌆', rank: 3, score: 7040, genre: 'EDM' },
      { slug: 'bass-drop', name: 'Bass Drop', emoji: '💥', rank: 4, score: 5930, genre: 'EDM' },
      { slug: 'dj-synch', name: 'DJ Synch', emoji: '🔄', rank: 5, score: 5020, genre: 'EDM' },
      { slug: 'wave-rider', name: 'Wave Rider', emoji: '🌊', rank: 6, score: 4120, genre: 'EDM' },
      { slug: 'hyper-drop', name: 'Hyper Drop', emoji: '⚡', rank: 7, score: 3380, genre: 'EDM' },
      { slug: 'sonic-burst', name: 'Sonic Burst', emoji: '💫', rank: 8, score: 2640, genre: 'EDM' },
      { slug: 'echo-zone', name: 'Echo Zone', emoji: '🔊', rank: 9, score: 2010, genre: 'EDM' },
      { slug: 'pulse-unit', name: 'Pulse Unit', emoji: '📡', rank: 10, score: 1570, genre: 'EDM' },
    ],
  },
  'Pop': {
    color: '#FF6B35',
    bg: '#2D1000',
    emoji: '🎀',
    performers: [
      { slug: 'poptronica', name: 'Poptronica', emoji: '🎀', rank: 1, score: 8750, genre: 'Pop' },
      { slug: 'mfts', name: 'MFTS', emoji: '🌟', rank: 2, score: 7830, genre: 'Pop' },
      { slug: 'sky-drop', name: 'Sky Drop', emoji: '🌤️', rank: 3, score: 6900, genre: 'Pop' },
      { slug: 'sweet-harmony', name: 'Sweet Harmony', emoji: '🍬', rank: 4, score: 5770, genre: 'Pop' },
      { slug: 'neon-angel', name: 'Neon Angel', emoji: '😇', rank: 5, score: 4810, genre: 'Pop' },
      { slug: 'cover-climber', name: 'Cover Climber', emoji: '📈', rank: 6, score: 3920, genre: 'Pop' },
      { slug: 'radio-burst', name: 'Radio Burst', emoji: '📻', rank: 7, score: 3180, genre: 'Pop' },
      { slug: 'chart-queen', name: 'Chart Queen', emoji: '👸', rank: 8, score: 2530, genre: 'Pop' },
      { slug: 'top-drop', name: 'Top Drop', emoji: '🎯', rank: 9, score: 1960, genre: 'Pop' },
      { slug: 'brit-wave', name: 'Brit Wave', emoji: '🇬🇧', rank: 10, score: 1440, genre: 'Pop' },
    ],
  },
  'Soul': {
    color: '#FFB800',
    bg: '#2D1F00',
    emoji: '🕯️',
    performers: [
      { slug: 'darkwave-diva', name: 'Darkwave Diva', emoji: '🌑', rank: 1, score: 8200, genre: 'Soul' },
      { slug: 'groove-master', name: 'Groove Master', emoji: '🕺', rank: 2, score: 7340, genre: 'Soul' },
      { slug: 'deep-roots', name: 'Deep Roots', emoji: '🌳', rank: 3, score: 6410, genre: 'Soul' },
      { slug: 'soulfire', name: 'Soulfire', emoji: '🔥', rank: 4, score: 5360, genre: 'Soul' },
      { slug: 'velvet-voice', name: 'Velvet Voice', emoji: '🎙️', rank: 5, score: 4420, genre: 'Soul' },
      { slug: 'rhythm-king', name: 'Rhythm King', emoji: '♟️', rank: 6, score: 3580, genre: 'Soul' },
      { slug: 'motown-echo', name: 'Motown Echo', emoji: '📼', rank: 7, score: 2870, genre: 'Soul' },
      { slug: 'warm-notes', name: 'Warm Notes', emoji: '☀️', rank: 8, score: 2210, genre: 'Soul' },
      { slug: 'church-groove', name: 'Church Groove', emoji: '⛪', rank: 9, score: 1730, genre: 'Soul' },
      { slug: 'old-school', name: 'Old School', emoji: '📡', rank: 10, score: 1280, genre: 'Soul' },
    ],
  },
  'Rap': {
    color: '#39FF14',
    bg: '#001A00',
    emoji: '💬',
    performers: [
      { slug: 'bobby-stanley', name: 'Bobby Stanley', emoji: '🎙️', rank: 1, score: 8960, genre: 'Rap' },
      { slug: 'night-rider-beats', name: 'NightRider', emoji: '🌙', rank: 2, score: 7980, genre: 'Rap' },
      { slug: 'rapid-fire', name: 'Rapid Fire', emoji: '💨', rank: 3, score: 6840, genre: 'Rap' },
      { slug: 'word-smith', name: 'Word Smith', emoji: '✏️', rank: 4, score: 5710, genre: 'Rap' },
      { slug: 'street-poet', name: 'Street Poet', emoji: '📝', rank: 5, score: 4690, genre: 'Rap' },
      { slug: 'lyric-lord', name: 'Lyric Lord', emoji: '📜', rank: 6, score: 3830, genre: 'Rap' },
      { slug: 'punch-line', name: 'Punch Line', emoji: '👊', rank: 7, score: 3060, genre: 'Rap' },
      { slug: 'mic-wreck', name: 'Mic Wreck', emoji: '🎤', rank: 8, score: 2430, genre: 'Rap' },
      { slug: 'flow-state', name: 'Flow State', emoji: '🌊', rank: 9, score: 1900, genre: 'Rap' },
      { slug: 'cold-bars', name: 'Cold Bars', emoji: '🧊', rank: 10, score: 1450, genre: 'Rap' },
    ],
  },
};

const GENRE_KEYS = Object.keys(GENRE_DATA);

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

const TMI_HUB_PHRASES = [
  { line1: 'WHO TOOK', line2: 'THE CROWN?' },
  { line1: 'GENRE', line2: 'BATTLE!' },
  { line1: 'CYPHER ARENA', line2: 'OPEN NOW' },
  { line1: 'VOTING', line2: 'LIVE!' },
  { line1: 'CHALLENGE', line2: 'THE CROWN' },
  { line1: 'BATTLE NIGHT', line2: 'ARENA' },
];

export default function Home1CoverPage() {
  const [genreIdx, setGenreIdx] = useState(0);
  const [orbitDeg, setOrbitDeg] = useState(0);
  const [voteCount, setVoteCount] = useState(4812);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [starburst, setStarburst] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showPhrase, setShowPhrase] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const genreKey = GENRE_KEYS[genreIdx % GENRE_KEYS.length]!;
  const genre = GENRE_DATA[genreKey]!;
  const performers = genre.performers;
  const crowdHolder = performers[0]!;

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

  // Hub phrase rotation — alternates between performer display and TMI phrases every 3.5s
  useEffect(() => {
    const id = setInterval(() => {
      setShowPhrase((prev) => {
        if (prev) setPhraseIdx((i) => (i + 1) % TMI_HUB_PHRASES.length);
        return !prev;
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const accentColor = genre.color;
  const bgColor = genre.bg;

  return (
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
        @keyframes h1Typewriter {
          0%, 5% { opacity: 0; transform: translateY(4px); }
          10%, 80% { opacity: 1; transform: translateY(0); }
          90%, 100% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes h1TypeColor {
          0%, 19% { color: #00FF7F; text-shadow: 0 0 12px rgba(0,255,127,0.6); }
          20%, 39% { color: #00E5FF; text-shadow: 0 0 12px rgba(0,229,255,0.6); }
          40%, 59% { color: #FFD700; text-shadow: 0 0 12px rgba(255,215,0,0.6); }
          60%, 79% { color: #E63000; text-shadow: 0 0 12px rgba(230,48,0,0.6); }
          80%, 100% { color: #FF8C00; text-shadow: 0 0 12px rgba(255,140,0,0.6); }
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

      {/* ── TABLOID MAGAZINE UNDERLAY — blueprint tmi_home1_complete_80s_magazine_final ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Scrolling tabloid panels — opacity .9 as specified in blueprint */}
        <div style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'h1TabloidScroll 16s linear infinite',
          opacity: 0.9,
          height: '100%',
          alignItems: 'stretch',
        }}>
          {/* 3 repetitions of 5 panels = seamless loop */}
          {[0, 1, 2].map(rep => (
            [
              { bg: '#FFD700', hdr: '#FF1493', title: 'WHO TOOK THE CROWN?',    sub: 'COVER PERFORMER', artist: 'BIG ACE',    tag: 'HIP-HOP · 4,812 VOTES',       cta: 'CYPHER OPEN',        c1: '#00BFFF' },
              { bg: '#FF1493', hdr: '#000000', title: 'BATTLE NIGHT CHAMPION',   sub: 'REIGNING CHAMP',  artist: 'WAVETEK',    tag: '47 WINS · HIP-HOP',           cta: '⚔️ CHALLENGE 8PM',   c1: '#FFD700' },
              { bg: '#00BFFF', hdr: '#000000', title: "WHO'S GOT THE BARS?",     sub: 'ON THE MIC NOW',  artist: 'NOVA CIPHER',tag: 'CYPHER OPEN · 841 WATCHING',   cta: 'DROP IN ANYTIME',    c1: '#FF1493' },
              { bg: '#000000', hdr: '#FFD700', title: 'CHALLENGE THE CROWN',     sub: 'DEFENDING NOW',   artist: 'BEAT THE BEAT',tag:'WAVETEK · 841 VOTES',          cta: 'ARENA SEATS 18,500', c1: '#FF1493' },
              { bg: '#9B59B6', hdr: '#FFD700', title: 'DJ BATTLE NIGHT',         sub: 'CURRENT #1 DJ',   artist: 'DJ KRAZE',   tag: 'DJ · TURNTABLIST',             cta: 'JOIN BATTLE QUEUE',  c1: '#00BFFF' },
            ].map((p, i) => (
              <div key={`${rep}-${i}`} style={{
                display: 'inline-flex',
                flexDirection: 'column',
                width: 210,
                flexShrink: 0,
                border: '3px solid #000',
                overflow: 'hidden',
                verticalAlign: 'top',
                background: p.bg,
                height: '100%',
              }}>
                <div style={{ background: p.hdr, padding: '6px 8px' }}>
                  <div style={{ fontSize: 6, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: "'Anton', sans-serif" }}>
                    THE MUSICIAN&apos;S INDEX · VOL.1 · $4.99
                  </div>
                </div>
                <div style={{ padding: '10px 8px', flex: 1 }}>
                  <div style={{
                    fontFamily: "'Anton', 'Impact', sans-serif",
                    fontSize: 22,
                    color: p.hdr === '#000000' ? (p.bg === '#FF1493' ? '#FFD700' : p.bg === '#000000' ? '#FFD700' : '#000') : '#000',
                    lineHeight: 1,
                    marginBottom: 5,
                  }}>{p.title}</div>
                  <div style={{ background: p.c1, padding: '4px 6px', marginBottom: 3 }}>
                    <div style={{ fontSize: 7, fontWeight: 800, color: '#000' }}>{p.sub}</div>
                    <div style={{ fontFamily: "'Anton', 'Impact', sans-serif", fontSize: 14, color: '#000' }}>{p.artist}</div>
                  </div>
                  <div style={{ fontSize: 7, color: 'rgba(0,0,0,0.6)' }}>{p.tag}</div>
                </div>
                <div style={{
                  background: '#000',
                  padding: '4px 8px',
                  fontSize: 7,
                  fontWeight: 700,
                  color: p.hdr === '#000000' ? p.c1 : '#FFD700',
                }}>{p.cta}</div>
              </div>
            ))
          ))}
        </div>
        {/* Radial vignette — clears the orbital center */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 72% 88% at center, transparent 20%, rgba(6,2,26,0.88) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Left/right linear fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(6,2,26,0.92) 0%, transparent 18%, transparent 82%, rgba(6,2,26,0.92) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Genre badge top left ── */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Link href="/home/1" style={{ textDecoration: 'none' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ← BACK
          </div>
        </Link>
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
          paddingTop: 52,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >

        {/* ── Masthead ── */}
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8, zIndex: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              overflow: 'visible',
              fontSize: 'clamp(14px, 3.5vw, 24px)',
              fontWeight: 900,
              letterSpacing: '0.35em',
              fontFamily: "'Inter', sans-serif",
              marginBottom: 12,
            }}
          >
            {"THE MUSICIAN'S INDEX".split('').map((char, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  minWidth: char === ' ' ? '0.5em' : 'auto',
                  opacity: 0,
                  animation: 'h1Typewriter 7s infinite, h1TypeColor 7s infinite',
                  animationDelay: `${index * 0.1}s, ${index * 0.1}s`,
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
              height: 18,
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 4,
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
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              background: `linear-gradient(135deg, #fff 0%, ${accentColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            WHO TOOK THE CROWN?
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 6,
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
          }}
        >
          {/* ════ LEFT PANEL ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            {/* Free Promotion */}
            <div style={{ background: 'rgba(5,8,21,0.88)', border: '1px solid rgba(255,45,170,0.25)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: '#FF2DAA', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>⭐ Free Promotion</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>Artists — get featured free.</div>
              {[{ name: 'Lagos Burst', genre: 'Afrobeat', views: '2,140', color: '#00FF88' }, { name: 'Nova Laugh', genre: 'Comedy', views: '980', color: '#AA2DFF' }].map((p) => (
                <div key={p.name} style={{ background: 'rgba(12,20,50,0.92)', border: `1px solid rgba(255,45,170,0.18)`, borderRadius: 6, padding: '7px 9px', marginBottom: 6, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: "'Inter',sans-serif" }}>{p.name}</div>
                    <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: `${p.color}18`, border: `1px solid ${p.color}44`, color: p.color, fontFamily: "'Inter',sans-serif" }}>{p.genre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 8, color: '#00FF88', fontFamily: "'Inter',sans-serif" }}>▲ {p.views}</span>
                    <button style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', border: '1px solid rgba(255,45,170,0.5)', background: 'transparent', color: '#FF2DAA', borderRadius: 3, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>BOOST</button>
                  </div>
                </div>
              ))}
              <div style={{ border: '1px dashed rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.04)', borderRadius: 6, padding: '8px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>+</div>
                <div style={{ fontSize: 8, color: '#FFD700', fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>Claim Free Slot</div>
              </div>
            </div>
            {/* Sponsor Spotlight */}
            <div style={{ background: 'rgba(5,8,21,0.88)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: '#00E5FF', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>💼 Sponsor Spotlight</div>
              <div style={{ background: 'rgba(12,20,50,0.92)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 6, padding: '8px 9px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#00E5FF', fontFamily: "'Inter',sans-serif" }}>Beats By TMX</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', margin: '2px 0 5px', fontFamily: "'Inter',sans-serif" }}>Official Season 1 Partner</div>
                <div style={{ height: 3, background: 'rgba(0,229,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: 3, background: '#00E5FF', borderRadius: 2, width: '72%' }} />
                </div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontFamily: "'Inter',sans-serif" }}>Campaign 72%</div>
              </div>
              <button style={{ width: '100%', marginTop: 6, padding: '4px', fontSize: 7, fontWeight: 700, border: '1px solid rgba(0,229,255,0.4)', background: 'transparent', color: '#00E5FF', borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.06em' }}>BECOME A SPONSOR</button>
            </div>
            {/* Venue Booking */}
            <div style={{ background: 'rgba(5,8,21,0.88)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: '#FF8C00', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>🏟 Venue Booking</div>
              {[{ day: 'SAT', venue: 'Main Arena' }, { day: 'SUN', venue: 'Theater' }, { day: 'FRI', venue: 'Club Room' }].map((v) => (
                <div key={v.day} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 9 }}>
                  <span style={{ color: '#FF8C00', fontWeight: 700, fontFamily: "'Inter',sans-serif", minWidth: 24 }}>{v.day}</span>
                  <span style={{ flex: 1, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter',sans-serif" }}>{v.venue}</span>
                  <button style={{ fontSize: 7, padding: '2px 6px', border: '1px solid rgba(0,255,136,0.5)', background: 'transparent', color: '#00FF88', borderRadius: 3, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Book</button>
                </div>
              ))}
            </div>
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

          {/* Center: Crown holder */}
          <Link
            href={`/articles/performer/${crowdHolder.slug}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textDecoration: 'none',
              zIndex: 20,
            }}
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
              <div
                style={{
                  fontSize: 'min(28px, 5vw)',
                  filter: `drop-shadow(0 0 6px ${accentColor})`,
                }}
              >
                {crowdHolder.emoji}
              </div>
              {showPhrase ? (
                <>
                  <div style={{
                    fontSize: 'min(8px, 1.6vw)',
                    fontWeight: 900,
                    color: '#FFD700',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif",
                    marginTop: 2,
                    lineHeight: 1.2,
                  }}>
                    {TMI_HUB_PHRASES[phraseIdx]?.line1}
                  </div>
                  <div style={{
                    fontSize: 'min(8px, 1.6vw)',
                    fontWeight: 900,
                    color: '#FF2DAA',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.2,
                  }}>
                    {TMI_HUB_PHRASES[phraseIdx]?.line2}
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </Link>

          {/* 10 orbit cards */}
          {performers.map((p, i) => {
            const pos = getOrbitPos(i, 10, 44);
            const cardSize = i === 0 ? 80 : 68;
            return (
              <Link
                key={p.slug}
                href={`/articles/performer/${p.slug}`}
                style={{ textDecoration: 'none' }}
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
                    {/* Performer emoji */}
                    <div style={{ fontSize: cardSize * 0.34, lineHeight: 1 }}>{p.emoji}</div>
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
            }}
          >
            🔘 CYPHER ARENA OPEN
          </div>

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
            }}
          >
            🗳️ VOTING OPEN: VOTE FOR #4!
          </div>
        </div>
        
          {/* ════ RIGHT PANEL ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            {/* Live Rankings */}
            <div style={{ background: 'rgba(5,8,21,0.88)', border: `1px solid ${accentColor}33`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: accentColor, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>🏆 Live Rankings</div>
              {performers.slice(0, 5).map((p, i) => (
                <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.4)', minWidth: 14, fontFamily: "'Inter',sans-serif" }}>#{p.rank}</span>
                  <span style={{ fontSize: 10, lineHeight: 1 }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontSize: 8, fontWeight: 700, color: '#fff', fontFamily: "'Inter',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 6, padding: '4px', fontSize: 7, fontWeight: 700, border: `1px solid ${accentColor}44`, background: 'transparent', color: accentColor, borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '0.06em' }}>SEE ALL RANKS</button>
            </div>
            {/* Live Activity */}
            <div style={{ background: 'rgba(5,8,21,0.88)', border: '1px solid rgba(255,45,170,0.25)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: '#FF2DAA', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>🔴 Live Now</div>
              {[{ name: 'Cypher Arena', viewers: '841', color: '#00E5FF' }, { name: 'Battle Stage', viewers: '2,130', color: '#FF2DAA' }, { name: 'Stream & Win', viewers: '3,412', color: '#FFD700' }].map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    <span style={{ fontSize: 9, color: '#fff', fontFamily: "'Inter',sans-serif" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>{item.viewers}</span>
                </div>
              ))}
            </div>
            {/* Ad Slot */}
            <div style={{ background: 'rgba(5,8,21,0.88)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>ADVERTISEMENT</div>
              <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 700, marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>Advertise Here</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>Reach live audiences from $25</div>
              <button style={{ width: '100%', padding: '5px', fontSize: 8, fontWeight: 700, border: '1px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.08)', color: '#FFD700', borderRadius: 4, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>GET STARTED</button>
            </div>
          </div>
        </div> {/* End Cinematic Wrapper */}

        {/* ── P6: Three independent video monitors (9500 / 13200 / 17000 ms, 2300ms stagger) ── */}
        <div style={{ width: '100%', maxWidth: 900, padding: '12px 10px 0', display: 'flex', gap: 10 }}>
          <PerformerMonitor performers={performers} offsetIdx={0} intervalMs={9500}  accentColor={accentColor} delayMs={0}    channelNum={1} />
          <PerformerMonitor performers={performers} offsetIdx={3} intervalMs={13200} accentColor={accentColor} delayMs={2300} channelNum={2} />
          <PerformerMonitor performers={performers} offsetIdx={6} intervalMs={17000} accentColor={accentColor} delayMs={4600} channelNum={3} />
        </div>

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

      </div>
    </div>
  );
}
