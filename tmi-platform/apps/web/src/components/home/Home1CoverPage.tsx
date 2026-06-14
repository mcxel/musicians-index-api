'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { TmiMagazineOrbitalUnderlay } from '@/components/home/TmiMagazineOrbitalUnderlay';

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

// ─── Clip-path shapes for orbit cards ─────────────────────────────────────────

const CARD_SHAPES = [
  'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  'circle(50% at 50% 50%)',
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  'circle(50% at 50% 50%)',
  'polygon(30% 0%, 70% 0%, 100% 25%, 100% 75%, 70% 100%, 30% 100%, 0% 75%, 0% 25%)',
];

// ─── Orbit card positions ──────────────────────────────────────────────────────

function getOrbitPos(i: number, total: number, radius: number) {
  const angle = (i / total) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  };
}

// ─── Ticker messages ───────────────────────────────────────────────────────────

const TICKER_MSGS = [
  '🔥 DRUM BATTLE LIVE RIGHT NOW',
  '👑 WHO TOOK THE CROWN? VOTE NOW',
  '⚡ CYPHER ARENA OPEN — GET IN',
  '🎤 SOMEBODY JUST GOT KNOCKED OFF #1',
  '💥 GENRE BATTLE — HIP-HOP VS R&B',
  '🚀 NEW PERFORMERS JUST INDEXED',
  '🗳️ VOTING LIVE — CROWN SHIFTING',
  '🔊 STREAM & WIN RADIO IS LIVE',
  '🎵 BEAT DROP AT MIDNIGHT — 8PM CYPHER',
  '👀 YOU DON\'T KNOW WHO\'S IN HERE',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home1CoverPage() {
  const [genreIdx, setGenreIdx] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [orbitDeg, setOrbitDeg] = useState(0);
  const [voteCount, setVoteCount] = useState(4812);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const genreKey = GENRE_KEYS[genreIdx % GENRE_KEYS.length]!;
  const genre = GENRE_DATA[genreKey]!;
  const performers = genre.performers;
  const crowdHolder = performers[0]!;

  // Orbit spin via requestAnimationFrame
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

  // Genre cycle every 6s
  useEffect(() => {
    const id = setInterval(() => setGenreIdx((i) => i + 1), 6000);
    return () => clearInterval(id);
  }, []);

  // Ticker cycle every 3s
  useEffect(() => {
    const id = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_MSGS.length), 3000);
    return () => clearInterval(id);
  }, []);

  // Vote count tick
  useEffect(() => {
    const id = setInterval(() => {
      setVoteCount((v) => v + Math.floor(Math.random() * 7 + 1));
    }, 820);
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
      {/* ── Cosmic underlay — absolute behind everything ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <TmiMagazineOrbitalUnderlay />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700;900&display=swap');

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
        @keyframes h1TickerSlide {
          0% { transform: translateY(100%); opacity: 0; }
          10%, 90% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes h1StickerPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
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
            opacity: 0.15,
            transform: `rotate(${i * 37}deg)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}

      {/* ── Genre badge top left ── */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          zIndex: 50,
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

      {/* ── Voting LIVE banner — in-flow, sits below MagazineNavBar ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: `linear-gradient(90deg, #1a0050 0%, ${accentColor}33 50%, #1a0050 100%)`,
          borderBottom: `2px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '7px 16px',
          flexWrap: 'wrap',
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
          position: 'relative',
          zIndex: 1,
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
                  animationDelay: `${index * 0.1}s, 0s`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
          <div
            style={{
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              color: accentColor,
              letterSpacing: '0.04em',
              lineHeight: 1,
              textShadow: `0 0 30px ${accentColor}88, 0 0 60px ${accentColor}33`,
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

        {/* ── Cinematic Edge-to-Edge Grid Wrapper ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(50px, 1fr) auto minmax(50px, 1fr)',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <div />

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
            {/* Spinning rings */}
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

            {/* Center crown holder */}
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
                <div
                  style={{
                    fontSize: 'min(28px, 5vw)',
                    animation: 'h1CrownFloat 3s ease-in-out infinite',
                    marginBottom: 2,
                    filter: 'drop-shadow(0 0 8px #FFD700)',
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
                <div
                  style={{
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
                  }}
                >
                  {crowdHolder.name}
                </div>
                <div
                  style={{
                    fontSize: 'min(8px, 1.5vw)',
                    fontWeight: 700,
                    color: '#FFD700',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  #1 {genreKey}
                </div>
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
                    <div
                      style={{
                        width: cardSize,
                        height: cardSize,
                        clipPath: CARD_SHAPES[i % CARD_SHAPES.length],
                        background: `linear-gradient(135deg, ${accentColor}33, ${bgColor})`,
                        border: `2px solid ${accentColor}66`,
                        boxShadow:
                          activeIdx === i
                            ? `0 0 24px ${accentColor}88`
                            : `0 0 12px ${accentColor}33`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                        transform: activeIdx === i ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >
                      <div style={{ fontSize: cardSize * 0.32, lineHeight: 1 }}>{p.emoji}</div>
                      <div
                        style={{
                          fontSize: cardSize * 0.1,
                          fontWeight: 900,
                          color: '#fff',
                          textAlign: 'center',
                          marginTop: 3,
                          fontFamily: "'Inter', sans-serif",
                          maxWidth: '85%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {p.name.split(' ')[0]}
                      </div>
                    </div>

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

          <div />
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

        {/* ── Tabloid ticker ── */}
        <div
          style={{
            width: '100%',
            background: `linear-gradient(90deg, transparent, ${accentColor}18, transparent)`,
            borderTop: `1px solid ${accentColor}22`,
            borderBottom: `1px solid ${accentColor}22`,
            padding: '8px 24px',
            marginTop: 16,
            overflow: 'hidden',
            height: 34,
            position: 'relative',
          }}
        >
          <div
            key={tickerIdx}
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: accentColor,
              letterSpacing: '0.15em',
              fontFamily: "'Inter', sans-serif",
              animation: 'h1TickerSlide 3s ease',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {TICKER_MSGS[tickerIdx]}
          </div>
        </div>

        {/* ── Top 10 performers grid ── */}
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
              background: 'linear-gradient(90deg, #2D0D6E, #1a0050, #2D0D6E)',
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
