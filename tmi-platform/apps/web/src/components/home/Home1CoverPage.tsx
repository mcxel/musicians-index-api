'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LayerCanvas from '@/components/canvas/LayerCanvas';
import type { TMILayer, TMILayerSessionState } from '@/types/layers';
import { SEED_FEEDS } from '@/lib/broadcast/BroadcastRotationEngine';
import type { BroadcastFeedItem } from '@/types/broadcast';
import ChallengeYourSongCTA from '@/components/challenge/ChallengeYourSongCTA';
import FounderAdvertiserBanner from '@/components/advertiser/FounderAdvertiserBanner';
import UserProfilePanel, { type UserProfilePanelUser } from '@/components/profile/UserProfilePanel';
import WelcomeArenaOverlay from '@/components/entry/WelcomeArenaOverlay';
import MiniChatPreview from '@/components/media/MiniChatPreview';
import MaskedVideoTile from '@/components/media/MaskedVideoTile';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import AdRailSlot from '@/components/ads/AdRailSlot';

const HOME1_LAYER_SESSION_KEY = 'TMI_OS_SessionState_Home1';
const HOME1_ISSUE_ID = 'issue-001-neon';
const THIS_WEEK_ORBIT_DIRECTION: 'clockwise' = 'clockwise';
const THIS_WEEK_SHAPE_PRESET: 'cutout' = 'cutout';

type Performer = {
  slug: string;
  name: string;
  genre: string;
  rank: number;
};

const PERFORMERS: Performer[] = [
  { slug: 'nova-cipher',  name: 'Nova Cipher',  genre: 'EDM',     rank: 1 },
  { slug: 'zion-freq',    name: 'Zion Freq',    genre: 'Hip-Hop', rank: 2 },
  { slug: 'astra-nova',   name: 'Astra Nova',   genre: 'R&B',     rank: 3 },
  { slug: 'ray-journey',  name: 'Ray Journey',  genre: 'Jazz',    rank: 4 },
  { slug: 'big-ace',      name: 'Big Ace',      genre: 'Hip-Hop', rank: 5 },
  { slug: 'lily88',       name: 'Lily88',       genre: 'Pop',     rank: 6 },
  { slug: 'zuri-bloom',   name: 'Zuri Bloom',   genre: 'Soul',    rank: 7 },
  { slug: 'flow-jamz',    name: 'Flow Jamz',    genre: 'Gospel',  rank: 8 },
  { slug: 'honeybee',     name: 'HoneyBee',     genre: 'R&B',     rank: 9 },
  { slug: 'chario-ace',   name: 'Chario Ace',   genre: 'Rap',     rank: 10 },
];

const ROTATING_SAYINGS = [
  '⚡ DANCE-OFF ROOM FILLING FAST',
  '🎤 OPEN MIC STARTING NOW',
  '🔥 CYPHER HEATING UP',
  '😂 COMEDY ROOM ACTIVE',
  '🕺 STREET BATTLE LIVE',
  '🏆 CROWD VOTE OPEN',
  'Go public → appear on the Lobby Wall',
  'Turn your sound into a movement.',
  'The stage is always on. Are you?',
];

const CHALLENGE_PROMO_LINES = [
  'Challenge Your Song Here',
  'Song For Song · Work For Work',
  'Video For Video · Crowd Votes Live',
  'Use What You Have Right Now: Songs + Video Links',
];

const BROADCAST_DECKS = [
  { label: 'GAME SHOWS', icon: '🎯', color: '#FFD700', href: '/live/rooms/dealer-feud-1000', cta: 'JOIN GAME →' },
  { label: 'CYPHER ARENA', icon: '🎤', color: '#FF2DAA', href: '/cypher/stage', cta: 'ENTER CYPHER →' },
  { label: 'BATTLES', icon: '⚔️', color: '#AA2DFF', href: '/battles', cta: 'WATCH BATTLE →' },
  { label: 'LIVE ROOMS', icon: '🏟️', color: '#00FFFF', href: '/live/lobby', cta: 'OPEN ROOM →' },
  { label: 'CONCERTS', icon: '🎶', color: '#00FF88', href: '/live/rooms/monthly-idol', cta: 'JOIN CONCERT →' },
  { label: 'WORLD PREMIERES', icon: '🌍', color: '#FF6B35', href: '/live/rooms/world-dance-party', cta: 'SEE PREMIERE →' },
  { label: 'SPONSOR WALL', icon: '🤝', color: '#FFD700', href: '/sponsors', cta: 'SPONSOR ARTIST →' },
  { label: 'MAGAZINE FEATURES', icon: '📰', color: '#00C8FF', href: '/magazine', cta: 'READ INTERVIEW →' },
  { label: 'CHALLENGE YOUR SONG', icon: '🎵', color: '#39FF14', href: '/battles/new', cta: 'CHALLENGE NOW →' },
] as const;

const GENRE_EMOJI: Record<string, string> = {
  'Hip-Hop': '🎤', 'R&B': '🎵', 'EDM': '🎛️', 'Rap': '🔊',
  'Soul': '🎶', 'Jazz': '🎺', 'Pop': '⭐', 'Gospel': '🙏',
  'Dance': '💃', 'Comedy': '😂', 'Global': '🌍', 'Variety': '🎶',
};

const GENRE_ACCENT: Record<string, string> = {
  'Hip-Hop': '#FF2DAA', 'R&B': '#AA2DFF', 'EDM': '#00FFFF', 'Rap': '#FFD700',
  'Soul': '#FF6B35', 'Jazz': '#00FF88', 'Pop': '#FF2DAA', 'Gospel': '#39FF14',
  'Dance': '#AA2DFF', 'Comedy': '#39FF14', 'Global': '#FF6B35', 'Variety': '#00FFFF',
};

function ctaLabel(kind: string): string {
  const map: Record<string, string> = {
    'battle': 'VOTE FOR WINNER →', 'cypher': 'ENTER CYPHER →',
    'live-camera': 'WATCH LIVE →', 'magazine-feature': 'READ FULL STORY →',
    'sponsor-billboard': 'SPONSOR ARTIST →', 'game-show': 'JOIN GAME →',
    'concert': 'JOIN CONCERT →', 'challenge': 'SUBMIT NOW →',
    'world-premiere': 'WATCH PREMIERE →', 'album-release': 'LISTEN NOW →',
  };
  return map[kind] ?? 'JOIN NOW →';
}

const DEFAULT_LAYERS: TMILayer[] = [
  {
    id: 'underlay-color-field',
    type: 'underlay',
    label: 'Underlay A · Color Field',
    assetUrl: '/assets/_converted_webp/Tmi Homepage 1.webp',
    x: 50,
    y: 47,
    width: 760,
    height: 430,
    scale: 1,
    rotation: -2,
    opacity: 0.34,
    blendMode: 'multiply',
    zIndex: 1,
    isLocked: false,
    animation: { type: 'drift', speed: 1.2 },
  },
  {
    id: 'underlay-depth-halftone',
    type: 'underlay',
    label: 'Underlay B · Depth',
    x: 52,
    y: 55,
    width: 760,
    height: 450,
    scale: 1,
    rotation: 4,
    opacity: 0.24,
    blendMode: 'soft-light',
    zIndex: 2,
    isLocked: false,
    text: 'HALFTONE / GRAIN / LIGHT LEAK',
    animation: { type: 'drift', speed: 0.8 },
  },
  {
    id: 'overlay-headline-banner',
    type: 'overlay',
    label: 'Overlay A · Hype Banner',
    x: 51,
    y: 21,
    width: 520,
    height: 74,
    scale: 1,
    rotation: -1,
    opacity: 0.95,
    blendMode: 'normal',
    zIndex: 18,
    isLocked: false,
    text: 'Challenge Your Song Here',
    href: '/battles/new',
    animation: { type: 'pulse', speed: 1.3 },
  },
  {
    id: 'overlay-physical-gloss',
    type: 'overlay',
    label: 'Overlay B · Grain Texture',
    x: 52,
    y: 58,
    width: 820,
    height: 470,
    scale: 1,
    rotation: 2,
    opacity: 0.06,
    blendMode: 'screen',
    zIndex: 19,
    isLocked: false,
    text: 'GRAIN · NOISE · TEXTURE',
    animation: { type: 'float', speed: 0.9 },
  },
  {
    id: 'sticker-voting-open',
    type: 'sticker',
    label: 'Sticker · Voting',
    x: 83,
    y: 31,
    width: 160,
    height: 56,
    scale: 1,
    rotation: 6,
    opacity: 1,
    blendMode: 'normal',
    zIndex: 22,
    isLocked: false,
    text: 'Voting Open',
    href: '/magazine',
  },
  {
    id: 'cta-join-free',
    type: 'cta',
    label: 'CTA · Join the Index',
    x: 15,
    y: 84,
    width: 170,
    height: 58,
    scale: 1,
    rotation: -2,
    opacity: 1,
    blendMode: 'normal',
    zIndex: 22,
    isLocked: false,
    text: 'JOIN THE INDEX',
    href: '/auth/signup',
  },
];

interface OrbitParticle { x: number; y: number; size: number; color: string; dur: number; delay: number; tx: number; ty: number; scale: number; opMin: number; opMax: number }
const OP_COLORS = ['#00FFFF', '#AA2DFF', '#FF2DAA', '#FFD700', '#00FF88'];
const ORBIT_PARTICLES_AMB: OrbitParticle[] = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 47 + 11) % 85 + 7,
  y: (i * 37 + 19) % 80 + 10,
  size: 2 + (i % 4),
  color: OP_COLORS[i % OP_COLORS.length]!,
  dur: 3 + (i % 5) * 0.8,
  delay: -(i * 0.7),
  tx: ((i * 23) % 40) - 20,
  ty: ((i * 17) % 40) - 20,
  scale: 0.6 + (i % 4) * 0.2,
  opMin: 0.1 + (i % 3) * 0.1,
  opMax: 0.4 + (i % 4) * 0.1,
}));

function orbitPoint(index: number, total: number, radius: number, angle: number) {
  const baseAngle = (index / total) * 360;
  const final = (baseAngle + angle - 90) * (Math.PI / 180);
  return {
    x: 50 + radius * Math.cos(final),
    y: 50 + radius * Math.sin(final),
  };
}

function getTypewriterText(source: string, visibleChars: number) {
  if (!source) return '';
  return source.slice(0, Math.max(0, Math.min(source.length, visibleChars)));
}

function safeParseLayerState(serialized: string | null): TMILayer[] | null {
  if (!serialized) return null;
  try {
    const parsed = JSON.parse(serialized) as TMILayerSessionState;
    if (!Array.isArray(parsed.layers)) return null;
    return parsed.layers;
  } catch {
    return null;
  }
}

export default function Home1CoverPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [layers, setLayers] = useState<TMILayer[]>(DEFAULT_LAYERS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [designMode, setDesignMode] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [broadcastDeckIndex, setBroadcastDeckIndex] = useState(0);
  const [deckTransitioning, setDeckTransitioning] = useState(false);
  const [canvasCardIndex, setCanvasCardIndex] = useState(0);
  const [profilePanel, setProfilePanel] = useState<UserProfilePanelUser | null>(null);

  const [sayingIndex, setSayingIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [challengePromoIndex, setChallengePromoIndex] = useState(0);

  const [issueLineIndex, setIssueLineIndex] = useState(0);
  const [issueTypedChars, setIssueTypedChars] = useState(0);

  // Data state populated post-hydration to prevent server/client mismatch
  const [liveCamFeeds, setLiveCamFeeds] = useState<BroadcastFeedItem[]>([]);
  const [battleFeeds, setBattleFeeds] = useState<BroadcastFeedItem[]>([]);
  const [cyphers, setCyphers] = useState<BroadcastFeedItem[]>([]);
  const [orbitPerformers, setOrbitPerformers] = useState<Performer[]>(PERFORMERS.slice(0, 10));
  const [canvasCards, setCanvasCards] = useState<Array<{ key: string; item: BroadcastFeedItem; rotation: number }>>([]);
  const [topLive, setTopLive] = useState<BroadcastFeedItem | null>(null);

  const currentSaying = ROTATING_SAYINGS[sayingIndex] ?? ROTATING_SAYINGS[0] ?? '';
  const issueLines = useMemo(
    () => [
      'MAGAZINE',
      'LIVE MUSIC',
      'LIVE PERFORMANCE',
      'LIVE CULTURE',
      'ARTISTS',
      'FANS',
      'VENUES',
      'BOOKINGS',
      'LIVE EVENTS',
    ],
    []
  );
  const currentIssueLine = issueLines[issueLineIndex] ?? issueLines[0] ?? '';

  useEffect(() => {
    // Post-mount data hydration
    const live = SEED_FEEDS.filter((f: BroadcastFeedItem) => f.kind === 'live-camera' && f.status === 'live').sort((a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0));
    const battles = SEED_FEEDS.filter((f: BroadcastFeedItem) => f.kind === 'battle' && f.status === 'live');
    const cyp = SEED_FEEDS.filter((f: BroadcastFeedItem) => f.kind === 'cypher');
    const magFeature = SEED_FEEDS.find((f: BroadcastFeedItem) => f.kind === 'magazine-feature');
    const sponsorSlot = SEED_FEEDS.find((f: BroadcastFeedItem) => f.kind === 'sponsor-billboard');

    setLiveCamFeeds(live);
    setBattleFeeds(battles);
    setCyphers(cyp);
    setTopLive(live[0] ?? SEED_FEEDS.find((f: BroadcastFeedItem) => f.status === 'live') ?? null);

    const fromFeeds: Performer[] = SEED_FEEDS
      .filter((f: BroadcastFeedItem) => f.status === 'live' || f.kind === 'live-camera' || f.kind === 'battle' || f.kind === 'cypher')
      .slice(0, 10)
      .map((f, i) => ({ slug: f.id, name: f.title, genre: f.genre ?? 'Live', rank: i + 1 }));
    
    const used = new Set(fromFeeds.map(p => p.slug));
    const stubs = PERFORMERS.filter(p => !used.has(p.slug)).map((p, i) => ({ ...p, rank: fromFeeds.length + i + 1 }));
    setOrbitPerformers([...fromFeeds, ...stubs].slice(0, 10));

    const cards: Array<{ key: string; item: BroadcastFeedItem; rotation: number }> = [];
    if (magFeature) cards.push({ key: 'mag', item: magFeature, rotation: -2.3 });
    if (battleFeeds[0]) cards.push({ key: 'battle', item: battleFeeds[0], rotation: 2 });
    if (sponsorSlot) cards.push({ key: 'sponsor', item: sponsorSlot, rotation: -1.3 });
    setCanvasCards(cards);
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fromStorage = safeParseLayerState(localStorage.getItem(HOME1_LAYER_SESSION_KEY));
    if (fromStorage) setLayers(fromStorage);
  }, []);

  useEffect(() => {
    const payload: TMILayerSessionState = {
      issueId: HOME1_ISSUE_ID,
      layers,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(HOME1_LAYER_SESSION_KEY, JSON.stringify(payload));
    (window as Window & { TMI_OS_SessionState?: TMILayerSessionState }).TMI_OS_SessionState = payload;
  }, [layers]);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('design');
    if (fromQuery === '1') setDesignMode(true);

    let cancelled = false;
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { authenticated?: boolean; user?: { role?: string; roles?: string[] } };
        setIsAuthenticated(Boolean(data?.authenticated));
        const roleBag = [data?.user?.role ?? '', ...(data?.user?.roles ?? [])].map((r) => r.toLowerCase());
        const admin = roleBag.some((role) => role === 'admin' || role === 'owner' || role === 'super_admin' || role === 'superadmin');
        if (!cancelled) {
          setIsAdmin(admin);
          if (!admin) setDesignMode(false);
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setDesignMode(false);
        }
      }
    };

    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = 0;

    const tick = (time: number) => {
      if (last > 0) {
        const delta = time - last;
        const directionFactor = THIS_WEEK_ORBIT_DIRECTION === 'clockwise' ? 1 : -1;
        setOrbitAngle((prev) => (prev + directionFactor * delta * 0.013) % 360);
      }
      last = time;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setVoteCount((v) => v + Math.floor(Math.random() * 6) + 1), 950);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setDeckTransitioning(true);
      setTimeout(() => {
        setBroadcastDeckIndex((i) => (i + 1) % BROADCAST_DECKS.length);
        setDeckTransitioning(false);
      }, 280);
    }, 13000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (canvasCards.length <= 1) return;
    const id = setInterval(() => {
      setCanvasCardIndex((i) => (i + 1) % canvasCards.length);
    }, 8000);
    return () => clearInterval(id);
  }, [canvasCards.length]);

  useEffect(() => {
    setTypedChars(0);
    let i = 0;
    const typeId = setInterval(() => {
      i += 1;
      setTypedChars(i);
      if (i >= currentSaying.length) clearInterval(typeId);
    }, 26);
    const rotateId = setTimeout(() => {
      setSayingIndex((idx) => (idx + 1) % ROTATING_SAYINGS.length);
    }, 3600);
    return () => {
      clearInterval(typeId);
      clearTimeout(rotateId);
    };
  }, [currentSaying]);

  useEffect(() => {
    const phrase = currentIssueLine;
    setIssueTypedChars(0);
    let i = 0;
    const allTimers: (ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[] = [];

    const typeId = setInterval(() => {
      i += 1;
      setIssueTypedChars(i);
      if (i >= phrase.length) clearInterval(typeId);
    }, 52);
    allTimers.push(typeId);

    const pauseMs = phrase.length * 52 + 900;
    const eraseStartId = setTimeout(() => {
      let ec = phrase.length;
      const eraseId = setInterval(() => {
        ec -= 1;
        setIssueTypedChars(ec);
        if (ec <= 0) {
          clearInterval(eraseId);
          setIssueLineIndex((idx) => (idx + 1) % issueLines.length);
        }
      }, 30);
      allTimers.push(eraseId);
    }, pauseMs);
    allTimers.push(eraseStartId);

    return () => allTimers.forEach((t) => { clearTimeout(t as ReturnType<typeof setTimeout>); clearInterval(t as ReturnType<typeof setInterval>); });
  }, [currentIssueLine, issueLines.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setChallengePromoIndex((idx) => (idx + 1) % CHALLENGE_PROMO_LINES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // Do not render heavy visuals until hydrated to prevent React tear-downs
  if (!isHydrated) return <div style={{ minHeight: '100vh', background: '#050510' }} />;

  return (
    <div className="tmi-home1-canvas-surface">
      <style>{`
        .tmi-home1-canvas-surface {
          min-height: 100vh;
          background: #050510;
          color: #f8f7f1;
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          overflow: hidden;
          position: relative;
        }
        
        .tmi-glass-panel {
          background: linear-gradient(180deg, rgba(20,25,35,0.6) 0%, rgba(5,5,12,0.8) 100%);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.25);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 20px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.8);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .tmi-glass-panel::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transform: skewX(-20deg);
          animation: tmiGlassSweep 8s infinite;
          pointer-events: none;
        }
        
        .tmi-crt-screen {
          position: relative;
          overflow: hidden;
        }
        .tmi-crt-screen::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          box-shadow: inset 0 0 60px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15);
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }

        .tmi-home1-canvas-surface::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 20% 10%, rgba(255, 45, 170, 0.2), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.2), transparent 40%),
            radial-gradient(circle at 35% 75%, rgba(255, 215, 0, 0.18), transparent 35%),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 4px);
        }

        /* ── Silk underlays: position:absolute so CSS perspective() on ancestor can't trap them ── */
        .tmi-kinetic-silk-1 {
          position: absolute;
          top: -20%; left: -20%; width: 140%; height: 140%;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(255,45,170,0.28) 0%, rgba(255,215,0,0.12) 40%, transparent 70%);
          animation: tmiSilkFlow 18s ease-in-out infinite alternate;
          filter: blur(16px);
          mix-blend-mode: screen;
        }

        .tmi-kinetic-silk-2 {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(90deg, transparent 0%, rgba(255,210,0,0.14) 30%, rgba(255,185,0,0.09) 70%, transparent 100%);
          background-size: 200% 100%;
          animation: tmiSilkFlowFast 10s linear infinite;
          filter: blur(10px);
          mix-blend-mode: overlay;
        }

        .tmi-kinetic-silk-3 {
          position: absolute;
          top: 10%; left: -30%; width: 160%; height: 80%;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 70% 50%, rgba(255,215,0,0.13) 0%, rgba(255,160,0,0.07) 40%, transparent 70%);
          animation: tmiSilkGold 22s ease-in-out infinite alternate;
          filter: blur(20px);
          mix-blend-mode: screen;
        }

        @keyframes tmiSilkGold {
          0% { transform: translateX(-8%) scale(1) rotate(-2deg); }
          100% { transform: translateX(8%) scale(1.08) rotate(2deg); }
        }

        .tmi-paper-underlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.44;
          mix-blend-mode: multiply;
          background: #e6d3ad;
          background-image: radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.42), transparent 34%), radial-gradient(circle at 82% 22%, rgba(255, 225, 141, 0.36), transparent 36%);
        }

        .tmi-halftone-underlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.13;
          mix-blend-mode: soft-light;
          background-image:
            radial-gradient(circle, #000 1.1px, transparent 1.1px),
            radial-gradient(circle, #ff2daa 0.8px, transparent 0.8px);
          background-size: 6px 6px, 5px 5px;
          background-position: 0 0, 2.5px 2.5px;
        }

        .tmi-grain-overlay {
          position: absolute;
          inset: 0;
          z-index: 90;
          pointer-events: none;
          opacity: 0.18;
          mix-blend-mode: multiply;
          background-image: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.10) 0px, rgba(0, 0, 0, 0.10) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.06) 0px, rgba(0, 0, 0, 0.06) 1px, transparent 1px, transparent 4px);
        }

        .tmi-gloss-overlay {
          position: absolute;
          inset: 0;
          z-index: 91;
          pointer-events: none;
          opacity: 0.34;
          mix-blend-mode: overlay;
          background: linear-gradient(130deg, rgba(255, 255, 255, 0.14) 0%, transparent 42%, rgba(0, 0, 0, 0.08) 100%);
        }

        .tmi-home1-shell {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          padding: 14px clamp(12px, 2vw, 24px) 56px;
        }

        .tmi-utility-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .tmi-utility-pill {
          background: #ff1458;
          color: #fff;
          border: 1px solid #0d1118;
          padding: 6px 10px;
          box-shadow: 0 14px 24px rgba(0, 0, 0, 0.5), -1px -1px 0 rgba(8, 8, 12, 1);
        }

        .tmi-masthead {
          border: 1px solid rgba(0,255,255,0.15);
          border-top: 1px solid rgba(0,255,255,0.4);
          background: radial-gradient(ellipse at top, rgba(0,255,255,0.1), transparent 70%), linear-gradient(180deg, rgba(15,20,35,0.5), rgba(5,5,12,0.8));
          backdrop-filter: blur(30px);
          text-align: center;
          padding: 18px 16px 16px;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,255,0.1);
          border-radius: 16px;
          margin-bottom: 12px;
          animation: tmiMastheadPulse 2.4s ease-in-out infinite;
          position: relative;
        }
        .tmi-masthead::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.04) 2px, rgba(0,255,255,0.04) 4px);
          border-radius: 12px;
        }
        .tmi-masthead::before {
          content: ''; position: absolute; top: 0; left: -110%; width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), rgba(0,255,255,0.03), transparent);
          transform: skewX(-15deg);
          animation: tmiMastheadSweep 7s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
          border-radius: 16px;
        }

        .tmi-masthead .logo {
          font-size: clamp(42px, 7.2vw, 86px);
          line-height: 0.9;
          text-transform: uppercase;
          color: #f7edcf;
          letter-spacing: 0.02em;
          text-shadow: 2px 0 #ff2daa, -2px 0 #00dcff;
          margin: 0;
        }

        .tmi-masthead .typewriter-line {
          min-height: 20px;
          margin-top: 8px;
          color: #ffd866;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .tmi-masthead .typewriter-line::after {
          content: '|';
          display: inline-block;
          margin-left: 3px;
          animation: tmiBlink 0.8s linear infinite;
        }

        .tmi-primary-cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 10px;
        }

        .tmi-primary-cta-row a,
        .tmi-primary-cta-row button {
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 9px;
          font-weight: 900;
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 1px solid rgba(255,255,255,0.25);
          border-bottom: 2px solid rgba(0,0,0,0.8);
          padding: 10px 14px;
          color: #fff;
          background: rgba(20,25,35,0.8);
          backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 10px rgba(0, 0, 0, 0.5);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tmi-primary-cta-row a:active,
        .tmi-primary-cta-row button:active {
          transform: translateY(2px);
          border-bottom: 0px solid rgba(0,0,0,0.8);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
        }
        .tmi-primary-cta-row .broadcast { background: linear-gradient(135deg, rgba(0,255,255,0.2), rgba(170,45,255,0.2)); color: #00FFFF; border-color: rgba(0,255,255,0.4); border-top-color: rgba(0,255,255,0.6); }
        .tmi-primary-cta-row .arena { background: rgba(170,45,255,0.2); color: #DDB7FF; border-color: rgba(170,45,255,0.4); border-top-color: rgba(170,45,255,0.6); }
        .tmi-primary-cta-row .challenge { background: rgba(255,45,170,0.2); color: #FF9BDB; border-color: rgba(255,45,170,0.4); border-top-color: rgba(255,45,170,0.6); }
        .tmi-primary-cta-row .advertise { background: rgba(255,143,41,0.2); color: #FFD4A3; border-color: rgba(255,143,41,0.4); border-top-color: rgba(255,143,41,0.6); }
        .tmi-primary-cta-row .sponsor { background: rgba(255,215,0,0.2); color: #FFE28B; border-color: rgba(255,215,0,0.4); border-top-color: rgba(255,215,0,0.6); }

        .tmi-canvas-stage {
          border: 1px solid rgba(255,255,255,0.05);
          border-top: 1px solid rgba(255,255,255,0.15);
          background: radial-gradient(ellipse at 50% 100%, rgba(170,45,255,0.12) 0%, rgba(5,5,12,0.8) 60%), #030308;
          backdrop-filter: blur(30px);
          min-height: 760px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 -50px 100px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.8);
          border-radius: 24px;
        }
        .tmi-canvas-stage::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }

        .tmi-collage-card {
          position: absolute;
          width: clamp(200px, 29vw, 350px);
          min-height: clamp(200px, 27vw, 330px);
          background: linear-gradient(145deg, rgba(25,30,45,0.9) 0%, rgba(10,12,20,0.95) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.25);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 30px 60px rgba(0, 0, 0, 0.7);
          border-radius: 16px;
          padding: 12px;
          z-index: 8;
          overflow: hidden;
        }

        .tmi-collage-card img {
          width: 100%;
          height: clamp(120px, 18vw, 190px);
          display: block;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
        }

        .tmi-collage-emoji {
          width: 100%;
          height: clamp(120px, 18vw, 190px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          margin-bottom: 8px;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.5);
        }

        .tmi-collage-emoji span {
          font-size: clamp(36px, 7vw, 52px);
          line-height: 1;
        }

        .tmi-collage-emoji small {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
        }

        .tmi-panel-emoji {
          width: 100%;
          height: 135px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          margin-bottom: 8px;
        }

        .tmi-panel-emoji span {
          font-size: clamp(32px, 5vw, 44px);
          line-height: 1;
        }

        .tmi-panel-emoji small {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .tmi-collage-card h3 {
          margin: 8px 0 4px;
          color: #f8dd84;
          font-size: clamp(20px, 2.3vw, 32px);
          line-height: 1;
          text-transform: uppercase;
          mix-blend-mode: multiply;
        }

        .tmi-collage-card p {
          margin: 0;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.86);
        }

        .tmi-collage-card a {
          display: inline-block;
          margin-top: 8px;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: #00e4ff;
        }

        .tmi-card-a { left: 4%; top: 10%; transform: rotate(-2.3deg); }
        .tmi-card-b { left: 36%; top: 7%; transform: rotate(2deg); }
        .tmi-card-c { left: 59%; top: 32%; transform: rotate(-1.3deg); }

        .tmi-sayings-strip {
          margin-top: 16px;
          border: 1px solid rgba(0,255,255,0.1);
          border-top: 1px solid rgba(0,255,255,0.3);
          border-bottom: 1px solid #000;
          background: #020308;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 30px rgba(0,0,0,1), 0 10px 20px rgba(0,0,0,0.6);
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }
        .tmi-sayings-strip::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px);
        }

        .tmi-sayings-strip p {
          margin: 0;
          color: #d4ffff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 900;
          text-shadow: 0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(0,255,255,0.4);
          animation: tmiAlertGlitch 3s infinite;
        }

        @keyframes tmiAlertGlitch {
          0%, 96%, 100% { opacity: 1; transform: translateX(0); }
          97% { opacity: 0.8; transform: translateX(-2px); }
          98% { opacity: 0.9; transform: translateX(2px); }
          99% { opacity: 0.5; transform: translateX(-1px); }
        }

        .tmi-orbit-section {
          margin-top: 16px;
          border: 1px solid rgba(255,215,0,0.15);
          border-top: 1px solid rgba(255,215,0,0.4);
          background: rgba(5,5,10,0.6);
          backdrop-filter: blur(30px);
          box-shadow: inset 0 0 80px rgba(0,0,0,0.9), 0 10px 40px rgba(0,0,0,0.5);
          border-radius: 16px;
          padding: 16px;
          position: relative;
          overflow: hidden;
        }

        .tmi-orbit-section::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }

        .tmi-orbit-section h2 {
          margin: 0 0 10px;
          text-align: center;
          color: #ffd56f;
          font-size: clamp(24px, 3.8vw, 44px);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          mix-blend-mode: multiply;
          position: relative;
          z-index: 1;
        }

        .tmi-orbit-meta {
          text-align: center;
          margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.11em;
          position: relative;
          z-index: 1;
        }

        .tmi-orbit-canvas {
          margin: 0 auto;
          position: relative;
          width: min(760px, 92vw);
          height: min(760px, 92vw);
          border-radius: 50%;
          z-index: 1;
        }

        .tmi-orbit-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        @keyframes tmiParticleDrift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(var(--ptx), var(--pty)) scale(var(--psc)); }
        }

        .tmi-orbit-ring {
          position: absolute;
          inset: 11%;
          border-radius: 50%;
          border: 2px solid rgba(255, 215, 0, 0.15);
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.08);
          background: rgba(0, 0, 0, 0.4);
        }

        .tmi-orbit-center,
        a.tmi-orbit-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: clamp(150px, 21vw, 230px);
          height: clamp(150px, 21vw, 230px);
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(43, 255, 210, 0.3) 0%, rgba(16, 183, 150, 0.1) 68%, rgba(0,0,0,0.8) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(43, 255, 210, 0.4);
          border-top: 2px solid rgba(43, 255, 210, 0.8);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.9), 0 22px 38px rgba(0, 0, 0, 0.56);
          display: grid;
          place-items: center;
          text-align: center;
          z-index: 10;
          animation: tmiCenterPulse 2.6s ease-in-out infinite;
        }

        .tmi-orbit-center strong {
          display: block;
          color: #00FF88;
          text-transform: uppercase;
          font-size: 21px;
          line-height: 1;
          text-shadow: 0 0 10px rgba(0,255,136,0.6);
        }

        .tmi-orbit-center small {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,0.6);
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .tmi-orbit-node {
          position: absolute;
          width: clamp(76px, 11vw, 108px);
          height: clamp(76px, 11vw, 108px);
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 1px solid rgba(255,255,255,0.25);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 15px 35px rgba(0, 0, 0, 0.6);
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(30,35,50,0.9), rgba(10,12,20,0.95));
          z-index: 9;
          transition: transform 160ms ease, box-shadow 160ms ease;
          text-decoration: none;
        }

        .tmi-orbit-node:hover {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 25px 45px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255,255,255,0.1);
        }

        .tmi-orbit-node img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.1) contrast(1.04);
        }

        .tmi-orbit-node .rank {
          position: absolute;
          left: -2px;
          top: -2px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border: 1px solid #0b0d14;
          display: grid;
          place-items: center;
          background: #ffd700;
          color: #111;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 900;
        }

        .tmi-orbit-node .meta {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 8, 15, 0.82);
          padding: 4px;
          text-align: center;
        }

        .tmi-orbit-node .meta strong {
          display: block;
          color: #f6f3ec;
          font-size: 10px;
          line-height: 1.1;
          text-transform: uppercase;
        }

        .tmi-orbit-node .meta small {
          display: block;
          margin-top: 1px;
          color: #00ddff;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .tmi-home1-second-section {
          margin-top: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          border-top: 1px solid rgba(255,255,255,0.15);
          background: radial-gradient(circle at 50% -20%, rgba(255,255,255,0.04), transparent 60%), rgba(5,5,12,0.5);
          backdrop-filter: blur(32px);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), inset 0 0 60px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.6);
          border-radius: 24px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .tmi-home1-second-section::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }

        .tmi-home1-second-section h3 {
          margin: 0 0 10px;
          color: #f8e27f;
          text-transform: uppercase;
          font-size: clamp(24px, 4vw, 46px);
          line-height: 0.95;
          mix-blend-mode: multiply;
          position: relative;
          z-index: 1;
        }

        .tmi-home1-second-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .tmi-challenge-promo {
          margin-top: 10px;
          margin-bottom: 6px;
          border: 2px solid #141d30;
          background: linear-gradient(92deg, rgba(255, 215, 0, 0.21) 0%, rgba(255, 45, 170, 0.28) 100%);
          min-height: 44px;
          display: grid;
          place-items: center;
          text-align: center;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.48), -1px -1px 0 rgba(5, 5, 10, 1);
          overflow: hidden;
        }

        .tmi-challenge-promo span {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: #fff7d5;
          text-transform: uppercase;
          animation: tmiPromoSlide 0.42s ease;
          padding: 0 10px;
        }

        @keyframes tmiPromoSlide {
          from { opacity: 0; transform: translateY(35%); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tmi-panel {
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(160deg, rgba(30, 35, 50, 0.4) 0%, rgba(5, 5, 12, 0.7) 100%);
          backdrop-filter: blur(24px);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 15px 35px rgba(0,0,0,0.5);
          border-top: 1px solid rgba(255,255,255,0.2);
          min-height: 160px;
          padding: 12px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tmi-panel:hover {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.25), 0 20px 40px rgba(0,0,0,0.7);
        }
        .tmi-panel::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        .tmi-panel img,
        .tmi-panel .tmi-panel-emoji {
          width: 100%;
          height: 135px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
        }

        .tmi-panel h4 {
          margin: 0 0 4px;
          color: #ffd66b;
          text-transform: uppercase;
          font-size: 19px;
          line-height: 1;
        }

        .tmi-panel p {
          margin: 0;
          font-family: 'Inter', sans-serif;
          color: rgba(255, 255, 255, 0.84);
          font-size: 12px;
          line-height: 1.42;
        }

        .tmi-panel a {
          margin-top: 8px;
          display: inline-block;
          text-decoration: none;
          color: #00e6ff;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 900;
        }

        .tmi-home1-footer {
          margin-top: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          border-top: 1px solid rgba(255,255,255,0.4);
          background: linear-gradient(135deg, #ff2daa 0%, #aa2dff 100%);
          text-align: center;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 20px 40px rgba(0, 0, 0, 0.6);
          padding: 24px 16px;
          border-radius: 20px;
        }

        .tmi-home1-footer h4 {
          margin: 0;
          color: #fff;
          text-transform: uppercase;
          font-size: clamp(28px, 4.2vw, 50px);
          line-height: 1;
          text-shadow: 2px 2px 0 #121520;
        }

        .tmi-home1-footer p {
          margin: 8px 0 0;
          font-family: 'Inter', sans-serif;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.1em;
          font-weight: 800;
        }

        .tmi-ad-rail-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @keyframes tmiMastheadPulse {
          0%, 100% { filter: saturate(1) brightness(1); }
          25% { filter: saturate(1.1) brightness(1.02); }
          50% { filter: saturate(1.18) brightness(1.05); }
          75% { filter: saturate(1.1) brightness(1.02); }
        }

        @keyframes tmiMastheadSweep {
          0%, 55% { left: -110%; opacity: 0; }
          58% { opacity: 1; }
          100% { left: 200%; opacity: 0; }
        }

        @keyframes tmiCenterPulse {
          0%, 100% { box-shadow: 0 22px 38px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(8, 8, 14, 1); }
          50% { box-shadow: 0 22px 38px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(8, 8, 14, 1), 0 0 28px rgba(43, 255, 210, 0.44); }
        }

        @keyframes tmiSlideIn {
          from { transform: translateY(30%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes tmiGlassSweep {
          0%, 50% { left: -100%; }
          100% { left: 200%; }
        }

        @keyframes tmiSilkFlow {
          0% { transform: translateX(-10%) scale(1); }
          100% { transform: translateX(10%) scale(1.1); }
        }
        
        @keyframes tmiSilkFlowFast {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes tmiRibbonScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }

        @keyframes tmiBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .tmi-broadcast-strip {
          margin-top: 16px;
          border: 1px solid rgba(255,45,170,0.2);
          border-top: 2px solid rgba(255,45,170,0.5);
          background: rgba(10,0,10,0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 16px;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.9), 0 0 20px rgba(255,45,170,0.15);
          overflow: hidden;
          border-radius: 8px;
          position: relative;
        }
        .tmi-broadcast-strip::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,45,170,0.05) 2px, rgba(255,45,170,0.05) 4px);
        }

        .tmi-broadcast-deck-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }

        .tmi-broadcast-deck-label.transitioning {
          opacity: 0;
          transform: translateY(8px);
        }

        .tmi-broadcast-cta {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 4px;
          border: 1px solid;
          transition: opacity 0.28s ease;
          white-space: nowrap;
        }

        .tmi-broadcast-cta.transitioning { opacity: 0; }

        @media (max-width: 1040px) {
          .tmi-canvas-stage {
            min-height: 1020px;
          }

          .tmi-card-a { left: 8%; top: 9%; }
          .tmi-card-b { left: 41%; top: 32%; }
          .tmi-card-c { left: 16%; top: 57%; }

          .tmi-home1-second-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .tmi-canvas-stage {
            min-height: 1220px;
          }

          .tmi-collage-card {
            width: calc(100% - 24px);
            left: 12px !important;
            transform: rotate(0deg) !important;
          }

          .tmi-card-a { top: 210px; }
          .tmi-card-b { top: 495px; }
          .tmi-card-c { top: 780px; }

          .tmi-home1-second-grid {
            grid-template-columns: 1fr;
          }

          .tmi-ad-rail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 1. Base Layer */}
      <div className="tmi-paper-underlay" />
      <div className="tmi-halftone-underlay" />
      
      {/* 2 & 3. Kinetic Silk Underlays B & A (Pointer Events None) */}
      <div className="tmi-kinetic-silk-1" />
      <div className="tmi-kinetic-silk-2" />
      <div className="tmi-kinetic-silk-3" />

      {/* 7. UI / CTA Layer Shell */}
      <div className="tmi-home1-shell">
        <div className="tmi-utility-row">
          <span className="tmi-utility-pill">Voting Live</span>
          <span className="tmi-utility-pill">{voteCount.toLocaleString()} Votes</span>
          <span className="tmi-utility-pill">Crown Updating</span>
        </div>

        <header className="tmi-masthead">
          <h1 className="logo">The Musician&apos;s Index</h1>
          <div className="typewriter-line">{getTypewriterText(currentIssueLine, issueTypedChars)}</div>
        </header>

        {/* ── Live Activity Ribbon ── */}
        <div style={{ overflow: 'hidden', background: 'rgba(255,20,20,0.04)', borderTop: '1px solid rgba(255,20,20,0.2)', borderBottom: '1px solid rgba(255,20,20,0.1)', borderRadius: 6, marginBottom: 8, height: 28, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', animation: 'tmiRibbonScroll 24s linear infinite', whiteSpace: 'nowrap', willChange: 'transform' }}>
            {[0, 1, 2].map((k) => (
              <span key={k} style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: 'rgba(255,90,90,0.9)', textTransform: 'uppercase', padding: '0 40px' }}>
                🔴 LIVE NOW &nbsp;·&nbsp; {(liveCamFeeds.length + battleFeeds.length) || 12} PERFORMERS &nbsp;·&nbsp; {cyphers.length || 4} CYPHERS ACTIVE &nbsp;·&nbsp; BATTLE STARTING SOON &nbsp;·&nbsp; 37 FANS ONLINE
              </span>
            ))}
          </div>
        </div>

        <ChallengeYourSongCTA variant="strip" />

        <Link href="/battles/new" style={{ textDecoration: 'none' }}>
          <div className="tmi-challenge-promo" aria-live="polite">
            <span>{CHALLENGE_PROMO_LINES[challengePromoIndex]}</span>
          </div>
        </Link>

        <FounderAdvertiserBanner />

        {/* ── HERO ENTER BUTTON ── */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 10px', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/live/lobby"
            className="tmi-glass-panel"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '16px 40px',
              background: 'linear-gradient(180deg, rgba(0,255,255,0.15) 0%, rgba(170,45,255,0.1) 100%)',
              border: '1px solid rgba(0,255,255,0.4)',
              borderTop: '2px solid rgba(0,255,255,0.8)',
              borderRadius: 12,
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(14px, 2vw, 18px)',
              letterSpacing: '0.2em',
              textDecoration: 'none',
              fontWeight: 900,
              boxShadow: '0 0 30px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,0,0,0.8)',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2020', display: 'inline-block', boxShadow: '0 0 8px #FF2020', animation: 'tmiBlink 1.1s step-end infinite' }} />
            ENTER LIVE ARENA
          </Link>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif", textAlign: 'center', width: '100%' }}>
            Jump into a live room in 1 tap
          </div>
        </div>

        <div className="tmi-primary-cta-row">
          <Link className="broadcast" href="/live/lobby">🎥 GO PUBLIC NOW</Link>
          <Link className="arena" href="/live/lobby">ENTER LIVE ARENA</Link>
          {isAuthenticated ? (
            <>
              <Link className="login" href="/account">My Account</Link>
              <Link className="login" href="/api/auth/logout">Logout</Link>
            </>
          ) : (
            <>
              <Link className="login" href="/auth/signin">Login</Link>
              <Link className="login" href="/auth/signup">Sign Up</Link>
            </>
          )}
          <Link className="challenge" href="/battles/new">Challenge Song</Link>
          <Link className="advertise" href="/hub/advertiser">🚀 ADVERTISE HERE</Link>
          <Link className="magazine" href="/magazine">Magazine</Link>
          <Link className="sponsor" href="/sponsors">Sponsor</Link>
          <Link className="advertise" href="/advertisers">Advertise</Link>
          {isAdmin ? (
            <button type="button" onClick={() => setDesignMode((value) => !value)}>
              {designMode ? 'Exit Design Mode' : 'Enable Design Mode'}
            </button>
          ) : null}
        </div>

        {/* ── ORBIT HERO — always first ── */}
        <section className="tmi-orbit-section">
          <h2>Weekly Crown Orbit</h2>
          <div className="tmi-orbit-meta">
            Top Ranked · Live Now · Updated In Real Time
          </div>

          <div className="tmi-orbit-canvas">
            <div className="tmi-orbit-ring" />

            {/* 5. Overlay A - Star Field Particles */}
            {ORBIT_PARTICLES_AMB.map((p, i) => (
              <div
                key={i}
                className="tmi-orbit-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                  opacity: p.opMin,
                  animation: `tmiParticleDrift ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
                  '--ptx': `${p.tx}px`,
                  '--pty': `${p.ty}px`,
                  '--psc': p.scale,
                } as React.CSSProperties}
              />
            ))}

            {/* 4. Top Artist Orbit / Interactive Nodes */}
            <Link
              className="tmi-orbit-center"
              href={topLive?.href ?? '/live/lobby'}
              style={{ textDecoration: 'none' }}
            >
              <div>
                <strong style={{ fontSize: 28 }}>{topLive?.avatarEmoji ?? '🎤'}</strong>
                <strong>{topLive?.title ?? 'LIVE NOW'}</strong>
                <small>{topLive?.viewerCount ? `${topLive.viewerCount.toLocaleString()} WATCHING` : topLive?.subtitle ?? '#1 LIVE'}</small>
              </div>
            </Link>

            {orbitPerformers.map((performer, index) => {
              const point = orbitPoint(index, orbitPerformers.length, 39, orbitAngle);
              const accent = GENRE_ACCENT[performer.genre] ?? '#FF2DAA';
              const emoji = GENRE_EMOJI[performer.genre] ?? '🎵';
              return (
                <button
                  key={performer.slug}
                  className="tmi-orbit-node"
                  style={{ left: `${point.x}%`, top: `${point.y}%`, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => setProfilePanel({
                    id: performer.slug,
                    name: performer.name,
                    role: 'artist',
                    avatarEmoji: emoji,
                    slug: performer.slug,
                    genre: performer.genre,
                    accentColor: accent,
                    isOnline: true,
                  })}
                >
                  <div style={{
                    width: '100%', height: '100%',
                    background: `linear-gradient(135deg, ${accent}30, #050510)`,
                    display: 'grid', placeItems: 'center',
                    fontSize: 'clamp(20px,3.5vw,28px)',
                  }}>
                    {emoji}
                  </div>
                  <span className="rank">{performer.rank}</span>
                  <div className="meta">
                    <strong>{performer.name}</strong>
                    <small>{performer.genre}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Broadcast deck banner ── */}
        {(() => {
          const deck = BROADCAST_DECKS[broadcastDeckIndex % BROADCAST_DECKS.length]!;
          return (
            <div className={`tmi-broadcast-strip`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF2020', display: 'inline-block', boxShadow: '0 0 8px #FF2020', animation: 'tmiBlink 1.1s step-end infinite' }} />
                <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#FF2020', fontFamily: "'Inter',sans-serif" }}>NOW BROADCASTING</span>
                <span className={`tmi-broadcast-deck-label${deckTransitioning ? ' transitioning' : ''}`} style={{ color: deck.color }}>
                  {deck.icon} {deck.label}
                </span>
              </div>
              <Link href={deck.href} className={`tmi-broadcast-cta${deckTransitioning ? ' transitioning' : ''}`} style={{ color: deck.color, borderColor: `${deck.color}66`, background: `${deck.color}12` }}>
                {deck.cta}
              </Link>
            </div>
          );
        })()}

        {/* ── Tabloid canvas stage ── */}
        <section className="tmi-canvas-stage" style={{ minHeight: canvasCards.length === 0 ? 120 : undefined }}>
          <AnimatePresence mode="wait">
            {canvasCards.length > 0 && (() => {
              const card = canvasCards[canvasCardIndex % canvasCards.length]!;
              return (
                <motion.article
                  key={card.key}
                  className="tmi-collage-card"
                  style={{ left: '50%', top: '7%', transform: `translateX(-50%) rotate(${card.rotation}deg)` }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  <div className="tmi-collage-emoji" style={{ background: `linear-gradient(135deg, ${card.item.accentColor}28, #050510)` }}>
                    <span>{card.item.avatarEmoji}</span>
                    {card.item.viewerCount && <small>{card.item.viewerCount.toLocaleString()} WATCHING</small>}
                    {card.item.kind === 'sponsor-billboard' && <small>OPEN SLOTS</small>}
                  </div>
                  <h3>{card.item.title}</h3>
                  <p>{card.item.subtitle ?? 'Live now — join the stage.'}</p>
                  <Link href={card.item.href}>{ctaLabel(card.item.kind)}</Link>
                </motion.article>
              );
            })()}
          </AnimatePresence>

          {/* Card navigation dots */}
          {canvasCards.length > 1 && (
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 20 }}>
              {canvasCards.map((c, i) => (
                <button
                  key={c.key}
                  onClick={() => setCanvasCardIndex(i)}
                  aria-label="Navigate Magazine Cards"
                  style={{
                    width: i === canvasCardIndex % canvasCards.length ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === canvasCardIndex % canvasCards.length ? '#00C8FF' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.25s ease, background 0.25s ease',
                  }}
                />
              ))}
            </div>
          )}

          <LayerCanvas layers={layers} onLayersChange={setLayers} isDesignMode={isAdmin && designMode} />
        </section>

        <section className="tmi-sayings-strip" aria-live="polite">
          <p>{getTypewriterText(currentSaying, typedChars)}</p>
        </section>

        {/* ── 3 Live Billboard Tiles ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
          {(() => {
            const liveCamera = liveCamFeeds[0];
            const battle = battleFeeds[0];
            const cypher = cyphers[0];
            const tiles = [
              liveCamera
                ? { title: liveCamera.title, subtitle: liveCamera.subtitle, href: liveCamera.href, accent: liveCamera.accentColor ?? '#FF2DAA', emoji: liveCamera.avatarEmoji ?? '🎤', viewers: liveCamera.viewerCount, isLive: liveCamera.status === 'live', cta: 'ENTER ROOM' }
                : { title: "Live Lobby", subtitle: "Join the crowd right now", href: '/live/lobby', accent: '#FF2DAA', emoji: '👥', viewers: 47, isLive: true, cta: 'ENTER ROOM' },
              battle
                ? { title: battle.title, subtitle: battle.subtitle, href: battle.href, accent: battle.accentColor ?? '#FFD700', emoji: battle.avatarEmoji ?? '⚔️', viewers: battle.viewerCount, isLive: battle.status === 'live', cta: 'WATCH BATTLE' }
                : { title: "Song Challenge Live", subtitle: "Song for song · Work for work", href: '/battles/new', accent: '#FFD700', emoji: '⚔️', viewers: 23, isLive: true, cta: 'JOIN BATTLE' },
              cypher
                ? { title: cypher.title, subtitle: cypher.subtitle, href: cypher.href, accent: cypher.accentColor ?? '#00C8FF', emoji: cypher.avatarEmoji ?? '🎤', viewers: cypher.viewerCount, isLive: true, cta: 'ENTER CYPHER' }
                : { title: "Cypher Arena", subtitle: "Drop bars · Earn your crown", href: '/cypher/stage', accent: '#00C8FF', emoji: '🎤', viewers: 31, isLive: true, cta: 'ENTER CYPHER' },
            ];
            return tiles.map((tile) => (
              <div key={tile.href} className="tmi-glass-panel tmi-crt-screen" style={{ border: `1px solid ${tile.accent}40`, borderTop: `2px solid ${tile.accent}80`, padding: 16, borderRadius: 16, boxShadow: `0 0 20px ${tile.accent}20` }}>
                <Link href={tile.href} style={{ textDecoration: 'none', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                  <MaskedVideoTile
                    shape="octagon"
                    performerName={tile.title}
                    isLive={tile.isLive}
                    viewerCount={typeof tile.viewers === 'number' ? tile.viewers : 0}
                    accentColor={tile.accent}
                    avatarEmoji={tile.emoji}
                    size={170}
                  />
                </Link>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', fontFamily: "'Inter',sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {tile.title}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.56)', fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>
                  {tile.subtitle}
                </div>
                <MiniChatPreview accentColor={tile.accent} />
                <Link href={tile.href} style={{ display: 'inline-block', marginTop: 8, fontSize: 9, fontWeight: 900, color: tile.accent, letterSpacing: '0.12em', fontFamily: "'Inter',sans-serif", textDecoration: 'none' }}>
                  {tile.cta} →
                </Link>
              </div>
            ));
          })()}
        </div>

        <section className="tmi-home1-second-section">
          <h3>Live Index Stories</h3>
          <div className="tmi-home1-second-grid">
            {/* Left — Top Live Cypher */}
            {cyphers[0] && (
              <article className="tmi-panel">
                <div className="tmi-panel-emoji" style={{ background: `linear-gradient(135deg, ${cyphers[0].accentColor}22, #050510)` }}>
                  <span>{cyphers[0].avatarEmoji}</span>
                  {cyphers[0].viewerCount && <small>{cyphers[0].viewerCount.toLocaleString()} WATCHING</small>}
                </div>
                <h4>{cyphers[0].title}</h4>
                <p>{cyphers[0].subtitle ?? 'Live cypher stage — step up and perform.'}</p>
                <Link href={cyphers[0].href}>{ctaLabel(cyphers[0].kind)}</Link>
              </article>
            )}

            {/* Center — Top Live Camera (Artist Interview slot) */}
            {liveCamFeeds[1] && (
              <article className="tmi-panel">
                <div className="tmi-panel-emoji" style={{ background: `linear-gradient(135deg, ${liveCamFeeds[1].accentColor}22, #050510)` }}>
                  <span>{liveCamFeeds[1].avatarEmoji}</span>
                  {liveCamFeeds[1].genre && <small>{liveCamFeeds[1].genre.toUpperCase()}</small>}
                </div>
                <h4>{liveCamFeeds[1].title}</h4>
                <p>{liveCamFeeds[1].subtitle ?? 'Live now — tune in and catch the performance.'}</p>
                <Link href={liveCamFeeds[1].href}>{ctaLabel(liveCamFeeds[1].kind)}</Link>
              </article>
            )}

            {/* Right — Latest editorial article */}
            {(() => {
              const latestArticle = getLatestEditorialArticles(1)[0];
              if (!latestArticle) return (
                <article className="tmi-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="tmi-panel-emoji" style={{ background: 'linear-gradient(135deg, #FFD70022, #050510)' }}>
                    <span>📰</span>
                    <small>EDITORIAL</small>
                  </div>
                  <h4>Stories Loading</h4>
                  <p>The editorial engine is loading the latest articles from the Index.</p>
                  <Link href="/articles">READ ALL STORIES →</Link>
                </article>
              );
              return (
                <article className="tmi-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="tmi-panel-emoji" style={{ background: `linear-gradient(135deg, ${latestArticle.accentColor}22, #050510)` }}>
                    <span>📰</span>
                    <small>LATEST STORY</small>
                  </div>
                  <h4>{latestArticle.title}</h4>
                  <p>{latestArticle.snippet}</p>
                  <Link href={`/articles/${latestArticle.slug}`}>READ FULL STORY →</Link>
                </article>
              );
            })()}
          </div>
        </section>

        <section className="tmi-ad-rail-grid" aria-label="Monetization rails">
          <AdRailSlot
            slotId="home1-lower-lobby-rail"
            hasSponsor={false}
            hasAdvertiser={false}
            title="Lower Lobby Rail"
          />
          <AdRailSlot
            slotId="home1-discovery-sidebar"
            hasSponsor={false}
            hasAdvertiser={false}
            title="Discovery Sidebar"
          />
        </section>

        <footer className="tmi-home1-footer">
          <h4>Weekly Cyphers</h4>
          <p>Who took the crown this week · This is your stage, be original</p>
        </footer>
      </div>

      {profilePanel && (
        <UserProfilePanel
          user={profilePanel}
          onClose={() => setProfilePanel(null)}
        />
      )}
      <WelcomeArenaOverlay />

      {/* 6. Top Gloss & Grain Overlays */}
      <div className="tmi-grain-overlay" />
      <div className="tmi-gloss-overlay" />
    </div>
  );
}
