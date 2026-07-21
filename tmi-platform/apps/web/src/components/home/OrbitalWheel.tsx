'use client';

import React, { memo, useEffect, useState } from 'react';
import MediaFallbackResolver from '@/components/media/MediaFallbackResolver';
import MotionPhotoPreview from '@/components/media/MotionPhotoPreview';
import Link from 'next/link';
import { PERFORMER_REGISTRY, isRankedEligible } from '@/lib/performers/PerformerRegistry';

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
}

const ACCENT_COLORS = ['#FF2DAA', '#FFD700', '#00FF88', '#00E5FF', '#9B59B6', '#FF8C00', '#E63000', '#FFD700', '#00E5FF', '#FF2DAA'];

// ─── GPU layer constants ────────────────────────────────────────────────────
const GPU_LAYER: React.CSSProperties = {
  willChange: 'transform',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};

// ─── OrbitalNodeCard ─────────────────────────────────────────────────────────
const OrbitalNodeCard = memo(function OrbitalNodeCard({ node }: { node: OrbitalNode }) {
  return (
    <Link href={`/profile/performer/${node.slug}`} style={{ textDecoration: 'none' }}>
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
          width: 100,
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
        <div style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${node.color}`, marginBottom: 6 }}>
          <MotionPhotoPreview
            imageSrc={node.imageUrl}
            motionSrc={node.motionUrl}
            altText={node.name}
            showBadge={false}
            autoPlay={true}
            style={{ width: '100%', height: '100%' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.8)', color: '#FFD700', fontSize: 9, fontWeight: 900, padding: '2px 6px', borderBottomRightRadius: 8, borderTopLeftRadius: 8, zIndex: 12 }}>#{node.rank}</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{node.name}</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{node.genre}</div>
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
    // ── Participant-Driven Orbital Registry Sorting ──
    // 1. Live performers currently streaming online
    // 2. Real humans and registered performers (sorted by rank/XP)
    // 3. Bot Fleet entries to fill remaining slots (wheel is never empty)
    const sortedPerformers = [...PERFORMER_REGISTRY].sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return (a.rank || 99) - (b.rank || 99);
    });

    const activePerformers = sortedPerformers.filter((p) => isRankedEligible(p)).slice(0, 10);
    const mappedNodes: OrbitalNode[] = activePerformers.map((p, i) => ({
      id: p.id,
      slug: p.slug,
      rank: p.rank || i + 1,
      name: p.name,
      genre: p.category || 'Hip-Hop',
      imageUrl: p.profileImageUrl || `https://i.pravatar.cc/200?u=${p.slug}`,
      isLive: Boolean(p.isLive),
      color: ACCENT_COLORS[i % ACCENT_COLORS.length]!,
    }));

    if (mappedNodes.length > 0) {
      // Top rank gets crown leader status
      const leader = mappedNodes.reduce((prev, curr) => (curr.rank < prev.rank ? curr : prev), mappedNodes[0]!);
      setCrownLeader(leader);
      setNodes(mappedNodes);
    }
  }, []);

  if (!nodes.length || !crownLeader) return null;

  // Dimensions
  const WHEEL_SIZE = 450;
  const CENTER_SIZE = 120;
  const RADIUS = 170;

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
          TOP RANKED · CANONICAL REGISTRY · REAL TIME
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
      <Link href={`/profile/performer/${crownLeader.slug}`} style={{ textDecoration: 'none', position: 'relative', zIndex: 15 }}>
        <div style={{
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #1a0f30 0%, #050210 100%)',
          border: '3px solid #FFD700',
          boxShadow: '0 0 40px rgba(255,215,0,0.8), inset 0 0 20px rgba(255,215,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 0 60px #FFD700'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(255,215,0,0.8)'; }}
        >
          <MotionPhotoPreview
            imageSrc={crownLeader.imageUrl}
            motionSrc={crownLeader.motionUrl}
            altText={crownLeader.name}
            showBadge={false}
            autoPlay={true}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}
          />
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '4px' }}>
            <div style={{ fontSize: 10, color: '#FFD700', letterSpacing: '0.15em', fontWeight: 900, textShadow: '0 0 8px #FFD700' }}>👑 #1 LEADER</div>
            <div style={{ fontFamily: 'var(--font-orbitron, Impact)', fontSize: 12, fontWeight: 900, color: '#fff', textShadow: '0 0 10px #000', lineHeight: 1.1, marginTop: 2 }}>
              {crownLeader.name.split(' ')[0]}<br/>{crownLeader.name.split(' ')[1] || ''}
            </div>
            {crownLeader.isLive && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FF2020', animation: 'blink 1s infinite', marginTop: 4, boxShadow: '0 0 8px #FF2020' }} />}
          </div>
        </div>
      </Link>

    </div>
  );
});