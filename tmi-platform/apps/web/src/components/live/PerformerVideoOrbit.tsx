'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface VideoWidget {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: string;
  status: 'live' | 'joining' | 'idle';
  viewerCount?: number;
  href?: string;
}

interface PerformerVideoOrbitProps {
  performers?: VideoWidget[];
  maxVisible?: number;
  onInvite?: (id: string) => void;
  accent?: string;
}

const DEFAULT_PERFORMERS: VideoWidget[] = [
  { id: 'p1', name: 'Wavetek',       emoji: '🎤', role: 'Performer',  color: '#FF2DAA', status: 'live',    viewerCount: 412, href: '/profile/performer/wavetek' },
  { id: 'p2', name: 'DJ Blend',      emoji: '🎧', role: 'DJ',         color: '#00FFFF', status: 'live',    viewerCount: 288, href: '/profile/performer/dj-blend' },
  { id: 'p3', name: 'King Verse',    emoji: '🎵', role: 'Rapper',     color: '#FFD700', status: 'joining', viewerCount: 88,  href: '/profile/performer/king-verse' },
  { id: 'p4', name: 'Lani Flame',    emoji: '🔥', role: 'R&B',        color: '#AA2DFF', status: 'live',    viewerCount: 194, href: '/profile/performer/lani-flame' },
  { id: 'p5', name: 'Cold Spark',    emoji: '⚡', role: 'Producer',   color: '#00FF88', status: 'idle',    viewerCount: 22,  href: '/profile/performer/cold-spark' },
  { id: 'p6', name: 'Mic Titan',     emoji: '🏆', role: 'MC',         color: '#FF6B35', status: 'joining', viewerCount: 61,  href: '/profile/performer/mic-titan' },
];

function getStatusPulseColor(status: VideoWidget['status']) {
  if (status === 'live')    return '#FF2DAA';
  if (status === 'joining') return '#FFD700';
  return '#444';
}

function getStatusLabel(status: VideoWidget['status']) {
  if (status === 'live')    return 'LIVE';
  if (status === 'joining') return 'JOINING';
  return 'IDLE';
}

export default function PerformerVideoOrbit({
  performers = DEFAULT_PERFORMERS,
  maxVisible = 6,
  onInvite,
  accent = '#FF2DAA',
}: PerformerVideoOrbitProps) {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [exitingId,  setExitingId]  = useState<string | null>(null);
  const [featured,   setFeatured]   = useState<string | null>(null);
  const rotationRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const innerTimers  = useRef<ReturnType<typeof setTimeout>[]>([]);

  function trackTimeout(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    innerTimers.current.push(id);
    return id;
  }

  // Initial pop-in animation — stagger each tile appearing
  useEffect(() => {
    const staggerIds: ReturnType<typeof setTimeout>[] = [];
    performers.slice(0, maxVisible).forEach((p, i) => {
      const t1 = setTimeout(() => {
        setEnteringId(p.id);
        setVisibleIds(prev => [...prev, p.id]);
        const t2 = setTimeout(() => setEnteringId(null), 600);
        staggerIds.push(t2);
      }, i * 280);
      staggerIds.push(t1);
    });
    return () => staggerIds.forEach(clearTimeout);
  }, [performers, maxVisible]);

  // Rotate: swap one tile every 8 seconds
  useEffect(() => {
    const allIds = performers.map(p => p.id);
    if (allIds.length <= maxVisible) return;

    rotationRef.current = setInterval(() => {
      setVisibleIds(prev => {
        const outIdx = Math.floor(Math.random() * prev.length);
        const outId  = prev[outIdx]!;
        const invisible = allIds.filter(id => !prev.includes(id));
        if (!invisible.length) return prev;
        const inId = invisible[Math.floor(Math.random() * invisible.length)]!;

        setExitingId(outId);
        trackTimeout(() => {
          setExitingId(null);
          setEnteringId(inId);
          trackTimeout(() => setEnteringId(null), 600);
        }, 500);

        const next = [...prev];
        next[outIdx] = inId;
        return next;
      });
    }, 8000);

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current);
      innerTimers.current.forEach(clearTimeout);
      innerTimers.current = [];
    };
  }, [performers, maxVisible]);

  // O(1) lookup via Set
  const visibleSet = new Set(visibleIds);
  const visible = performers.filter(p => visibleSet.has(p.id));

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes videoOrbitEnter {
          0%   { opacity: 0; transform: scale(0.55) rotate(-8deg); }
          60%  { transform: scale(1.06) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes videoOrbitExit {
          0%   { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.45) rotate(10deg); }
        }
        @keyframes videoOrbitPulse {
          0%,100% { box-shadow: 0 0 0 0 transparent; }
          50%     { box-shadow: 0 0 0 3px rgba(255,45,170,0.45); }
        }
        @keyframes videoOrbitLiveDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes videoOrbitJoin {
          0%,100% { opacity: 0.6; }
          50%     { opacity: 1; }
        }
        .video-orbit-tile {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .video-orbit-tile:hover {
          transform: scale(1.05) translateY(-2px) !important;
          z-index: 10;
        }
        .video-orbit-tile.featured {
          transform: scale(1.12) !important;
          z-index: 20;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          🎭 PERFORMER LOBBY · {visible.filter(p => p.status === 'live').length} LIVE
        </div>
        {onInvite && (
          <button
            onClick={() => onInvite('invite')}
            style={{ fontSize: 9, fontWeight: 800, color: accent, border: `1px solid ${accent}44`, borderRadius: 5, padding: '3px 10px', background: `${accent}08`, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            + INVITE
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {visible.map(p => {
          const isEntering = enteringId === p.id;
          const isExiting  = exitingId  === p.id;
          const isFeat     = featured   === p.id;
          const pulseColor = getStatusPulseColor(p.status);

          return (
            <div
              key={p.id}
              className={`video-orbit-tile${isFeat ? ' featured' : ''}`}
              onClick={() => setFeatured(f => f === p.id ? null : p.id)}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: `1.5px solid ${isFeat ? p.color : 'rgba(255,255,255,0.08)'}`,
                background: `linear-gradient(160deg, ${p.color}14, rgba(5,5,16,0.97))`,
                cursor: 'pointer',
                animation: isEntering
                  ? 'videoOrbitEnter 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards'
                  : isExiting
                  ? 'videoOrbitExit 0.45s ease forwards'
                  : p.status === 'live'
                  ? 'videoOrbitPulse 2.5s ease-in-out infinite'
                  : 'none',
              }}
            >
              {/* Video placeholder / avatar */}
              <div style={{
                height: 80,
                background: `radial-gradient(ellipse at 50% 30%, ${p.color}22, rgba(5,5,16,0.95))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                fontSize: 32,
              }}>
                {p.emoji}

                {/* Live indicator */}
                {p.status === 'live' && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#FF2DAA',
                    animation: 'videoOrbitLiveDot 1.1s ease-in-out infinite',
                  }} />
                )}

                {/* Joining shimmer */}
                {p.status === 'joining' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `repeating-linear-gradient(90deg, transparent, ${p.color}08 50%, transparent 100%)`,
                    backgroundSize: '200% 100%',
                    animation: 'videoOrbitJoin 1.4s ease-in-out infinite',
                  }} />
                )}

                {/* Viewer count */}
                {p.viewerCount !== undefined && p.status === 'live' && (
                  <div style={{
                    position: 'absolute', bottom: 5, left: 6,
                    fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(0,0,0,0.55)', borderRadius: 3, padding: '1px 5px',
                  }}>
                    👁 {p.viewerCount}
                  </div>
                )}
              </div>

              {/* Info bar */}
              <div style={{ padding: '7px 9px', background: 'rgba(0,0,0,0.45)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize: 7, fontWeight: 800, color: pulseColor, flexShrink: 0, letterSpacing: '0.08em' }}>{getStatusLabel(p.status)}</span>
                </div>
                <div style={{ fontSize: 8, color: p.color, marginTop: 1 }}>{p.role}</div>

                {/* Action row — visible on featured */}
                {isFeat && (
                  <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                    {p.href && (
                      <Link href={p.href} onClick={e => e.stopPropagation()} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontWeight: 800, color: p.color, border: `1px solid ${p.color}44`, borderRadius: 4, padding: '3px 0', textDecoration: 'none', background: `${p.color}0a` }}>
                        PROFILE
                      </Link>
                    )}
                    {onInvite && (
                      <button onClick={e => { e.stopPropagation(); onInvite(p.id); }} style={{ flex: 1, fontSize: 8, fontWeight: 800, color: '#050510', background: p.color, border: 'none', borderRadius: 4, padding: '3px 0', cursor: 'pointer' }}>
                        CALL IN
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow indicator */}
      {performers.length > maxVisible && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
          +{performers.length - maxVisible} more performers rotating in
        </div>
      )}
    </div>
  );
}
