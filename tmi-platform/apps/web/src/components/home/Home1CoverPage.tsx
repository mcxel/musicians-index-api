'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LayerCanvas from '@/components/canvas/LayerCanvas';
import type { TMILayer, TMILayerSessionState } from '@/types/layers';

const HOME1_LAYER_SESSION_KEY = 'TMI_OS_SessionState_Home1';
const HOME1_ISSUE_ID = 'issue-001-neon';
const THIS_WEEK_ORBIT_DIRECTION: 'clockwise' = 'clockwise';
const THIS_WEEK_SHAPE_PRESET: 'cutout' = 'cutout';

type Performer = {
  slug: string;
  name: string;
  genre: string;
  avatar: string;
  rank: number;
};

const PERFORMERS: Performer[] = [
  { slug: 'ricardo-parker', name: 'Ricardo Parker', genre: 'Hip-Hop', avatar: '/tmi-curated/mag-20.jpg', rank: 1 },
  { slug: 'chario-ace', name: 'Chario Ace', genre: 'Hip-Hop', avatar: '/tmi-curated/mag-28.jpg', rank: 2 },
  { slug: 'honeybee', name: 'HoneyBee', genre: 'R&B', avatar: '/tmi-curated/mag-35.jpg', rank: 3 },
  { slug: 'nova-cipher', name: 'Nova Cipher', genre: 'EDM', avatar: '/tmi-curated/mag-42.jpg', rank: 4 },
  { slug: 'jamal-harris', name: 'Jamal Harris', genre: 'Rap', avatar: '/tmi-curated/mag-50.jpg', rank: 5 },
  { slug: 'zuri-bloom', name: 'Zuri Bloom', genre: 'Soul', avatar: '/tmi-curated/mag-58.jpg', rank: 6 },
  { slug: 'ray-journey', name: 'Ray Journey', genre: 'Jazz', avatar: '/tmi-curated/mag-66.jpg', rank: 7 },
  { slug: 'big-ace', name: 'Big Ace', genre: 'Hip-Hop', avatar: '/tmi-curated/mag-74.jpg', rank: 8 },
  { slug: 'lily88', name: 'Lily88', genre: 'Pop', avatar: '/tmi-curated/mag-82.jpg', rank: 9 },
  { slug: 'flow-jamz', name: 'Flow Jamz', genre: 'Gospel', avatar: '/tmi-curated/home1.jpg', rank: 10 },
];

const ROTATING_SAYINGS = [
  'You are not a musician if you are not in the Index.',
  'Your ad would look good here.',
  'All artists are welcome.',
  'Come join the magazine.',
  'Your business belongs in the Index.',
  'Who took the crown this week?',
  'Challenge your song here.',
  'This is your stage, be original.',
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
    label: 'Overlay B · Gloss/Scratches',
    assetUrl: '/assets/_converted_webp/The Musician\'s Index Magazine images/img00042.webp',
    x: 52,
    y: 58,
    width: 820,
    height: 470,
    scale: 1,
    rotation: 2,
    opacity: 0.19,
    blendMode: 'screen',
    zIndex: 19,
    isLocked: false,
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
    label: 'CTA · Join Free',
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
    text: 'Join Free',
    href: '/auth/signup',
  },
];

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
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [layers, setLayers] = useState<TMILayer[]>(DEFAULT_LAYERS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [designMode, setDesignMode] = useState(false);
  const [voteCount, setVoteCount] = useState(4891);
  const [broadcastDeckIndex, setBroadcastDeckIndex] = useState(0);
  const [deckTransitioning, setDeckTransitioning] = useState(false);

  const [sayingIndex, setSayingIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  const [issueLineIndex, setIssueLineIndex] = useState(0);
  const [issueTypedChars, setIssueTypedChars] = useState(0);

  const currentSaying = ROTATING_SAYINGS[sayingIndex] ?? ROTATING_SAYINGS[0] ?? '';
  const issueLines = useMemo(
    () => [
      'The Musician\'s Index · Issue 31 · Gospel Edition',
      'LayerCanvas Design Mode · Home 1 Only',
      'Living Magazine Cover Simulation',
    ],
    []
  );
  const currentIssueLine = issueLines[issueLineIndex] ?? issueLines[0] ?? '';

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
        const roleBag = [data?.user?.role ?? '', ...(data?.user?.roles ?? [])].map((r) => r.toLowerCase());
        const admin = roleBag.some((role) => role === 'admin' || role === 'owner' || role === 'super_admin' || role === 'superadmin');
        if (!cancelled) {
          setIsAdmin(admin);
          if (!admin) setDesignMode(false);
        }
      } catch {
        if (!cancelled) {
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
    setIssueTypedChars(0);
    let i = 0;
    const typeId = setInterval(() => {
      i += 1;
      setIssueTypedChars(i);
      if (i >= currentIssueLine.length) clearInterval(typeId);
    }, 20);
    const rotateId = setTimeout(() => {
      setIssueLineIndex((idx) => (idx + 1) % issueLines.length);
    }, 3400);
    return () => {
      clearInterval(typeId);
      clearTimeout(rotateId);
    };
  }, [currentIssueLine, issueLines.length]);

  return (
    <div className="tmi-home1-canvas-surface">
      <style>{`
        .tmi-home1-canvas-surface {
          min-height: 100vh;
          background: #050510;
          color: #f8f7f1;
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .tmi-home1-canvas-surface::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 20% 10%, rgba(255, 45, 170, 0.2), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.2), transparent 40%),
            radial-gradient(circle at 35% 75%, rgba(255, 215, 0, 0.18), transparent 35%),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 4px);
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
          border: 2px solid #111724;
          background: linear-gradient(160deg, #05060c 0%, #11182d 48%, #190f2e 100%);
          text-align: center;
          padding: 18px 16px 16px;
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.52), -1px -1px 0 rgba(6, 7, 12, 1);
          margin-bottom: 12px;
          animation: tmiMastheadPulse 2.4s ease-in-out infinite;
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
          letter-spacing: 0.1em;
          font-size: 10px;
          font-weight: 900;
          border: 1px solid #0f1320;
          padding: 8px 12px;
          color: #fff;
          background: #18203a;
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.45), -1px -1px 0 rgba(8, 8, 12, 1);
          cursor: pointer;
        }

        .tmi-primary-cta-row .join { background: #00b67a; }
        .tmi-primary-cta-row .login { background: #25304d; }
        .tmi-primary-cta-row .challenge { background: #ff2daa; }
        .tmi-primary-cta-row .arena { background: #aa2dff; }
        .tmi-primary-cta-row .magazine { background: #00cde9; color: #0d1120; }
        .tmi-primary-cta-row .sponsor { background: #ffd700; color: #0d1120; }
        .tmi-primary-cta-row .advertise { background: #ff8f29; }

        .tmi-canvas-stage {
          border: 2px solid #131b2a;
          background: linear-gradient(145deg, #0b1f32 0%, #28113a 50%, #1a0a2a 100%);
          min-height: 760px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 40px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(6, 6, 12, 0.95);
        }

        .tmi-collage-card {
          position: absolute;
          width: clamp(200px, 29vw, 350px);
          min-height: clamp(200px, 27vw, 330px);
          background: rgba(12, 13, 24, 0.95);
          border: 2px solid #121826;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), -1px -1px 0 rgba(6, 7, 12, 1);
          padding: 10px;
          z-index: 8;
          overflow: hidden;
        }

        .tmi-collage-card img {
          width: 100%;
          height: clamp(120px, 18vw, 190px);
          display: block;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.18);
          clip-path: polygon(8% 0, 100% 0, 92% 100%, 0 100%);
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
          margin-top: 12px;
          border: 2px solid #0f1320;
          background: #03050d;
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.48), -1px -1px 0 rgba(5, 5, 10, 1);
          overflow: hidden;
        }

        .tmi-sayings-strip p {
          margin: 0;
          color: #00e7ff;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 900;
          animation: tmiSlideIn 0.28s ease;
        }

        .tmi-sayings-strip p::after {
          content: '|';
          margin-left: 3px;
          animation: tmiBlink 0.8s linear infinite;
        }

        .tmi-orbit-section {
          margin-top: 14px;
          border: 2px solid #101727;
          background: linear-gradient(140deg, #081e2f 0%, #0f2739 47%, #1a1130 100%);
          box-shadow: 0 24px 40px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(6, 6, 12, 0.95);
          padding: 16px;
          position: relative;
        }

        .tmi-orbit-section h2 {
          margin: 0 0 10px;
          text-align: center;
          color: #ffd56f;
          font-size: clamp(24px, 3.8vw, 44px);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          mix-blend-mode: multiply;
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
        }

        .tmi-orbit-canvas {
          margin: 0 auto;
          position: relative;
          width: min(760px, 92vw);
          height: min(760px, 92vw);
          border-radius: 50%;
        }

        .tmi-orbit-ring {
          position: absolute;
          inset: 11%;
          border-radius: 50%;
          border: 2px solid rgba(0, 255, 255, 0.45);
          box-shadow: 0 0 0 2px rgba(12, 16, 28, 0.95), 0 0 28px rgba(0, 255, 255, 0.32);
        }

        .tmi-orbit-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: clamp(150px, 21vw, 230px);
          height: clamp(150px, 21vw, 230px);
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #2bffd2 0%, #10b796 68%);
          border: 3px solid #0a1118;
          box-shadow: 0 22px 38px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(8, 8, 14, 1);
          display: grid;
          place-items: center;
          text-align: center;
          z-index: 10;
          animation: tmiCenterPulse 2.6s ease-in-out infinite;
        }

        .tmi-orbit-center strong {
          display: block;
          color: #052015;
          text-transform: uppercase;
          font-size: 21px;
          line-height: 1;
        }

        .tmi-orbit-center small {
          display: block;
          margin-top: 3px;
          color: #082f25;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .tmi-orbit-node {
          position: absolute;
          width: clamp(76px, 11vw, 108px);
          height: clamp(76px, 11vw, 108px);
          transform: translate(-50%, -50%);
          border: 2px solid #0a1016;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.48), -1px -1px 0 rgba(6, 6, 12, 0.95);
          overflow: hidden;
          background: #111625;
          z-index: 9;
          transition: transform 160ms ease;
          text-decoration: none;
          clip-path: polygon(7% 0, 100% 0, 93% 100%, 0 100%);
        }

        .tmi-orbit-node:hover {
          transform: translate(-50%, -50%) scale(1.08);
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
          margin-top: 14px;
          border: 2px solid #11192b;
          background: linear-gradient(150deg, #230b2f 0%, #10263a 48%, #17343a 100%);
          padding: 16px;
          box-shadow: 0 24px 40px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(6, 6, 12, 0.95);
        }

        .tmi-home1-second-section h3 {
          margin: 0 0 10px;
          color: #f8e27f;
          text-transform: uppercase;
          font-size: clamp(24px, 4vw, 46px);
          line-height: 0.95;
          mix-blend-mode: multiply;
        }

        .tmi-home1-second-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 10px;
        }

        .tmi-panel {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(8, 10, 20, 0.86);
          min-height: 160px;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45), -1px -1px 0 rgba(5, 5, 10, 0.95);
          padding: 10px;
        }

        .tmi-panel img {
          width: 100%;
          height: 135px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.16);
          margin-bottom: 8px;
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
          border: 2px solid #0f1320;
          background: #ff2daa;
          text-align: center;
          box-shadow: 0 22px 38px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(7, 7, 12, 0.95);
          padding: 20px 16px;
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

        @keyframes tmiMastheadPulse {
          0%, 100% { filter: saturate(1); }
          50% { filter: saturate(1.12); }
        }

        @keyframes tmiCenterPulse {
          0%, 100% { box-shadow: 0 22px 38px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(8, 8, 14, 1); }
          50% { box-shadow: 0 22px 38px rgba(0, 0, 0, 0.56), -1px -1px 0 rgba(8, 8, 14, 1), 0 0 28px rgba(43, 255, 210, 0.44); }
        }

        @keyframes tmiSlideIn {
          from { transform: translateY(30%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes tmiBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .tmi-broadcast-strip {
          margin-top: 12px;
          border: 2px solid #0f1320;
          background: #03050d;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 16px;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.48), -1px -1px 0 rgba(5, 5, 10, 1);
          overflow: hidden;
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
        }
      `}</style>

      <div className="tmi-home1-shell">
        <div className="tmi-utility-row">
          <span className="tmi-utility-pill">Voting Live</span>
          <span className="tmi-utility-pill">{voteCount.toLocaleString()} Votes</span>
          <span className="tmi-utility-pill">Crown Updating</span>
          <span className="tmi-utility-pill">Home 1 LayerCanvas</span>
        </div>

        <header className="tmi-masthead">
          <h1 className="logo">The Musician's Index</h1>
          <div className="typewriter-line">{getTypewriterText(currentIssueLine, issueTypedChars)}</div>
        </header>

        <div className="tmi-primary-cta-row">
          <Link className="join" href="/auth/signup">Join Free</Link>
          <Link className="login" href="/auth/signin">Login</Link>
          <Link className="challenge" href="/battles/new">Challenge Song</Link>
          <Link className="arena" href="/cypher/stage">Cypher Arena</Link>
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
            Direction: {THIS_WEEK_ORBIT_DIRECTION} · Shape preset: {THIS_WEEK_SHAPE_PRESET} · Next preset: octagon
          </div>

          <div className="tmi-orbit-canvas">
            <div className="tmi-orbit-ring" />

            <div className="tmi-orbit-center">
              <div>
                <strong>Blessed Voice</strong>
                <small>#1 Gospel</small>
              </div>
            </div>

            {PERFORMERS.map((performer, index) => {
              const point = orbitPoint(index, PERFORMERS.length, 39, orbitAngle);
              return (
                <Link
                  key={performer.slug}
                  className="tmi-orbit-node"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  href={`/articles/performer/${performer.slug}`}
                >
                  <img src={performer.avatar} alt={performer.name} />
                  <span className="rank">{performer.rank}</span>
                  <div className="meta">
                    <strong>{performer.name}</strong>
                    <small>{performer.genre}</small>
                  </div>
                </Link>
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
        <section className="tmi-canvas-stage">
          <article className="tmi-collage-card tmi-card-a">
            <img src="/assets/_converted_webp/Tmi Homepage 1.webp" alt="Cover layout" />
            <h3>Cover Story</h3>
            <p>Main profile and sponsor collage block for this issue's narrative angle.</p>
            <Link href="/articles/performer/ricardo-parker">Open Performer Article</Link>
          </article>

          <article className="tmi-collage-card tmi-card-b">
            <img src="/assets/_converted_webp/Tmi Homepage 1-2.webp" alt="Open tabloid spread" />
            <h3>Magazine Spread</h3>
            <p>Layer-aware spread that keeps CTA, orbit, and editorial flow unified.</p>
            <Link href="/magazine">Open Magazine</Link>
          </article>

          <article className="tmi-collage-card tmi-card-c">
            <img src="/assets/_converted_webp/The Musician's Index Magazine images/img00042.webp" alt="Sponsor and news tiles" />
            <h3>Ad + News</h3>
            <p>Sponsor and article tiles can be repositioned in design mode for conversion optimization.</p>
            <Link href="/sponsors">Open Sponsor Rail</Link>
          </article>

          <LayerCanvas layers={layers} onLayersChange={setLayers} isDesignMode={isAdmin && designMode} />
        </section>

        <section className="tmi-sayings-strip" aria-live="polite">
          <p>{getTypewriterText(currentSaying, typedChars)}</p>
        </section>

        {/* ── 3 Live Billboard Tiles ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14 }}>
          {[
            { title: "Guess Who's Up In Here?", subtitle: "It's gonna be a fun week in the Index", href: '/live/lobby', accent: '#FF2DAA', emoji: '👀' },
            { title: "Song Challenge Live", subtitle: "Song for song · Work for work · Video for video", href: '/battles/new', accent: '#FFD700', emoji: '🎵' },
            { title: "This Week In TMI", subtitle: "Who took the crown · This is your stage", href: '/magazine', accent: '#00FFFF', emoji: '📰' },
          ].map((tile) => (
            <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none' }}>
              <div style={{
                border: `1.5px solid ${tile.accent}44`,
                background: `linear-gradient(145deg, ${tile.accent}12, rgba(5,5,16,0.92))`,
                borderRadius: 8,
                padding: '14px 12px',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: `0 0 18px ${tile.accent}18`,
                transition: 'box-shadow 0.3s ease',
              }}>
                <div style={{ fontSize: 22 }}>{tile.emoji}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', fontFamily: "'Inter',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {tile.title}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter',sans-serif" }}>
                    {tile.subtitle}
                  </div>
                </div>
                <div style={{ fontSize: 8, fontWeight: 900, color: tile.accent, letterSpacing: '0.12em', fontFamily: "'Inter',sans-serif", marginTop: 8 }}>
                  JOIN NOW →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="tmi-home1-second-section">
          <h3>Home 1 Tabloid Extended Section</h3>
          <div className="tmi-home1-second-grid">
            <article className="tmi-panel">
              <img src="/tmi-curated/mag-74.jpg" alt="Cypher panel" />
              <h4>Cypher Arena Live</h4>
              <p>Real-time cypher panel with performer story overlays and active crowd actions.</p>
              <Link href="/cypher/stage">Open Cypher Arena</Link>
            </article>

            <article className="tmi-panel">
              <img src="/tmi-curated/mag-66.jpg" alt="Artist interview panel" />
              <h4>Artist Interview</h4>
              <p>Interview block auto-updates when performer profile content is refreshed.</p>
              <Link href="/articles/performer/ray-journey">Read Artist Profile</Link>
            </article>

            <article className="tmi-panel">
              <img src="/tmi-curated/mag-58.jpg" alt="Business and ad panel" />
              <h4>Advertise With Us</h4>
              <p>Business placement panel tied to sponsor and advertiser route destinations.</p>
              <Link href="/advertisers">Open Advertiser Hub</Link>
            </article>
          </div>
        </section>

        <footer className="tmi-home1-footer">
          <h4>Weekly Cyphers</h4>
          <p>Who took the crown this week · This is your stage, be original</p>
        </footer>
      </div>
    </div>
  );
}
