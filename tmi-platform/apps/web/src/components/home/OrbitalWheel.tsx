'use client';

import React, { memo, useEffect, useState } from 'react';
import MotionPhotoPreview from '@/components/media/MotionPhotoPreview';
import Link from 'next/link';
import {
  ORBITAL_TOP_N,
  publishUniversalRankingSnapshot,
  subscribeUniversalRanking,
  type RankSlot,
} from '@/lib/rankings/UniversalRankingSnapshot';

interface OrbitalNode {
  id: string;
  slug: string;
  rank: number;
  name: string;
  genre: string;
  imageUrl: string;
  motionUrl?: string;
  isLive: boolean;
  color: string;
  profileRoute: string;
  verified?: boolean;
  honorTitle?: string;
  points?: number;
}

const ACCENT_COLORS = ['#FF2DAA', '#FFD700', '#00FF88', '#00E5FF', '#9B59B6', '#FF8C00', '#E63000', '#FFD700', '#00E5FF', '#FF2DAA'];

// ─── GPU layer constants ────────────────────────────────────────────────────
const GPU_LAYER: React.CSSProperties = {
  willChange: 'transform',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};

// ─── OrbitalNodeCard ─────────────────────────────────────────────────────────
function slotToNode(slot: RankSlot, index: number): OrbitalNode {
  return {
    id: slot.profileId,
    slug: slot.slug,
    rank: slot.rank,
    name: slot.displayName,
    genre: slot.genre ?? (slot.kind === 'bot' ? 'Bot Seat' : 'All Genres'),
    imageUrl: slot.avatarUrl || '/images/tmi-placeholder.jpg',
    motionUrl: slot.motionUrl,
    isLive: Boolean(slot.isLive),
    color: ACCENT_COLORS[index % ACCENT_COLORS.length]!,
    profileRoute: slot.profileRoute,
    verified: slot.kind === 'human' && Boolean(slot.verified),
    honorTitle: slot.honorTitle,
    points: slot.points,
  };
}

const OrbitalNodeCard = memo(function OrbitalNodeCard({ node }: { node: OrbitalNode }) {
  const rank = node.rank;
  const isPodium = rank === 2 || rank === 3;
  const cardW = rank === 1 ? 118 : isPodium ? 108 : 88;
  const portrait = rank === 1 ? 76 : isPodium ? 68 : 52;
  const badgePx = rank <= 3 ? 28 : 24;
  return (
    <Link href={node.profileRoute} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'rgba(5,8,21,0.95)',
          border: `2px solid ${node.color}`,
          borderRadius: 12,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: `0 0 20px ${node.color}33`,
          width: cardW,
          transition: 'all 0.2s ease-in-out',
          ...GPU_LAYER,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateZ(0) scale(1.1)';
          e.currentTarget.style.boxShadow = `0 0 30px ${node.color}77`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateZ(0) scale(1)';
          e.currentTarget.style.boxShadow = `0 0 20px ${node.color}33`;
        }}
      >
        <div style={{ position: 'relative', width: portrait, height: portrait, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${node.color}`, marginBottom: 6 }}>
          <MotionPhotoPreview
            imageSrc={node.imageUrl}
            motionSrc={node.motionUrl}
            altText={node.name}
            showBadge={false}
            autoPlay={true}
            style={{ width: '100%', height: '100%' }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            minWidth: badgePx,
            background: rank === 1 ? 'linear-gradient(135deg,#FFD700,#FF9500)' : 'rgba(0,0,0,0.88)',
            color: rank === 1 ? '#050510' : '#FFD700',
            fontSize: rank <= 3 ? 12 : 11,
            fontWeight: 900,
            padding: '3px 7px',
            borderBottomRightRadius: 8,
            borderTopLeftRadius: 8,
            zIndex: 12,
            fontFamily: "var(--font-orbitron, Impact)",
          }}>#{rank}</div>
        </div>
        <div style={{ fontSize: rank <= 3 ? 11 : 10, fontWeight: 900, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{node.name}</div>
        {node.verified && (
          <div style={{ fontSize: 7, color: '#00FFFF', fontWeight: 800, marginTop: 2 }}>Verified</div>
        )}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          {typeof node.points === 'number' && node.points > 0 ? `XP ${node.points.toLocaleString()}` : 'XP —'}
        </div>
        {node.honorTitle ? (
          <div style={{ fontSize: 7, color: '#FFD700', fontWeight: 800, marginTop: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.honorTitle}</div>
        ) : null}
        {node.isLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2020', boxShadow: '0 0 6px #FF2020', animation: 'blink 1s infinite' }} />
            <span style={{ fontSize: 8, color: '#FF2020', fontWeight: 900, letterSpacing: '0.1em' }}>LIVE</span>
          </div>
        )}
      </div>
    </Link>
  );
});

// ─── OrbitalWheel ─────────────────────────────────────────────────────────────
// Wrapped in React.memo: Home1CoverPage re-renders every 6 s (genre cycle),
// but OrbitalWheel takes no props so memo prevents cascade re-renders that
// interrupt the running CSS animation and cause mobile flicker.
export default memo(function OrbitalWheel() {
  const [nodes, setNodes] = useState<OrbitalNode[]>([]);
  const [crownLeader, setCrownLeader] = useState<OrbitalNode | null>(null);

  useEffect(() => {
    // Universal Ranking snapshot — MJ Rule human-over-bot, Top 12
    publishUniversalRankingSnapshot(undefined, ORBITAL_TOP_N);
    return subscribeUniversalRanking((snap) => {
      const mapped = snap.slots.slice(0, ORBITAL_TOP_N).map(slotToNode);
      if (mapped.length === 0) {
        setNodes([]);
        setCrownLeader(null);
        return;
      }
      setNodes(mapped.filter((n) => n.rank !== 1));
      setCrownLeader(mapped[0] ?? null);
    });
  }, []);

  if (!crownLeader) return null;

  // Dimensions
  const WHEEL_SIZE = 520;
  const CENTER_SIZE = 220;
  const RADIUS = 200;

  return (
    // Outer container: `contain: layout style` isolates this subtree from
    // the rest of the page layout so parent re-renders can't trigger a
    // layout recalc inside the wheel.
    <div style={{
      position: 'relative',
      width: WHEEL_SIZE,
      height: WHEEL_SIZE,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // GPU lock — promotes the entire wheel to its own compositing layer
      willChange: 'transform',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      contain: 'layout style',
    }}>
      {/* Self-contained keyframe definitions for orbit & counterOrbit to guarantee zero flicker across all pages */}
      <style jsx global>{`
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes counterOrbit {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      
      <div style={{ position: 'absolute', top: -30, left: 0, right: 0, textAlign: 'center', zIndex: 15 }}>
        <div style={{ fontFamily: 'var(--font-orbitron, Impact)', fontSize: 14, fontWeight: 900, color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,0.6)', letterSpacing: '0.1em' }}>
          👑 WEEKLY CROWN ORBIT
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginTop: 4 }}>
          TOP {ORBITAL_TOP_N} · HUMAN-OVER-BOT · LIVE SNAPSHOT
        </div>
      </div>

      {/* SVG Rings */}
      <svg viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`} width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={RADIUS + 30} fill="none" stroke="rgba(255,215,0,0.08)" strokeWidth="1" />
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={RADIUS - 5} fill="none" stroke="rgba(255,45,170,0.25)" strokeWidth="1.5" strokeDasharray="4 9" style={{ transformOrigin: 'center', animation: 'orbit 13s linear infinite' }}/>
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={RADIUS - 65} fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1" strokeDasharray="3 11" style={{ transformOrigin: 'center', animation: 'orbit 13s linear infinite reverse' }}/>
        <circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={CENTER_SIZE / 2 + 10} fill="none" stroke="#FFD700" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }}/>
      </svg>

      {/* Artist Nodes — spinning ring promoted to its own GPU layer */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        animation: 'orbit 13s linear infinite',
        transformOrigin: 'center',
        // GPU layer: the orbit animation runs here — isolate from parent repaints
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}>
        {nodes.map((node, i) => {
          const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
          const x = (WHEEL_SIZE / 2) + RADIUS * Math.cos(angle);
          const y = (WHEEL_SIZE / 2) + RADIUS * Math.sin(angle);

          return (
            // Counter-rotation wrapper — each card spins opposite to the ring
            // so it stays upright while the ring rotates beneath it.
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%) translateZ(0)',
                transformOrigin: 'center',
                animation: 'counterOrbit 13s linear infinite',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <OrbitalNodeCard node={node} />
            </div>
          );
        })}
      </div>

      {/* #1 Crown Leader Center Hub — Grow & Glow Effect */}
      <Link href={crownLeader.profileRoute} style={{ textDecoration: 'none', position: 'relative', zIndex: 15 }}>
        <div style={{
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #1a0f30 0%, #050210 100%)',
          border: '4px solid #FFD700',
          boxShadow: '0 0 56px rgba(255,215,0,0.9), inset 0 0 24px rgba(255,215,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 70px #FFD700'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 56px rgba(255,215,0,0.9)'; }}
        >
          <MotionPhotoPreview
            imageSrc={crownLeader.imageUrl}
            motionSrc={crownLeader.motionUrl}
            altText={crownLeader.name}
            showBadge={false}
            autoPlay={true}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.85 }}
          />
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, background: 'linear-gradient(135deg,#FFD700,#FF9500)', color: '#050510', fontWeight: 900, fontSize: 16, padding: '4px 10px', borderRadius: 8, fontFamily: 'var(--font-orbitron, Impact)' }}>#1</div>
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '8px', marginTop: 28 }}>
            <div style={{ fontSize: 18, color: '#FFD700', letterSpacing: '0.12em', fontWeight: 900, textShadow: '0 0 10px #FFD700' }}>👑</div>
            <div style={{ fontFamily: 'var(--font-orbitron, Impact)', fontSize: 16, fontWeight: 900, color: '#fff', textShadow: '0 2px 10px #000', lineHeight: 1.15, marginTop: 4 }}>
              {crownLeader.name}
            </div>
            {crownLeader.verified && <div style={{ fontSize: 9, color: '#00FFFF', fontWeight: 800, marginTop: 3 }}>Verified Performer</div>}
            <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 800, marginTop: 2 }}>
              {typeof crownLeader.points === 'number' && crownLeader.points > 0 ? `XP ${crownLeader.points.toLocaleString()}` : 'XP —'}
            </div>
            {crownLeader.honorTitle ? (
              <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 800, marginTop: 4 }}>{crownLeader.honorTitle}</div>
            ) : null}
            {crownLeader.isLive && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FF2020', animation: 'blink 1s infinite', marginTop: 4, boxShadow: '0 0 8px #FF2020' }} />}
          </div>
        </div>
      </Link>

    </div>
  );
});