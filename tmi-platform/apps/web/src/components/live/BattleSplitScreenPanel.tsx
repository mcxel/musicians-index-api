'use client';

/**
 * BattleSplitScreenPanel — 3-panel broadcast director for battles/cyphers/challenges.
 *
 * Panels: Performer A | Host | Performer B
 * Auto-rotates layout every 90s to keep broadcast from going stale (Rule 16).
 * Supports winner "end effects" — crown drop, glow burst, loser fade.
 * Supports 2-panel mode (1v1 no host) and 3-panel mode (performers + host).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface BattlePerformer {
  id: string;
  name: string;
  profileImageUrl: string;
  videoStreamUrl?: string;
  score?: number;
  tier?: string;
  category?: string;
}

export interface BattleHost {
  id: string;
  name: string;
  profileImageUrl: string;
  videoStreamUrl?: string;
  scriptLine?: string;
}

export type BattleEventType =
  | 'battle'
  | 'cypher'
  | 'challenge'
  | 'joke-off'
  | 'dance-off'
  | 'dirty-dozens'
  | 'beat-battle'
  | 'producer-showcase';

export type PanelLayout =
  | 'THREE_EQUAL'          // [A] [Host] [B] — equal thirds
  | 'HOST_FEATURED'        // [Host large] [A small] [B small]
  | 'A_FEATURED'           // [A large] [Host pip] [B small]
  | 'B_FEATURED'           // [B large] [Host pip] [A small]
  | 'VS_MODE'              // [A] [B] — host as small PIP overlay, no center column
  | 'HOST_LEFT'            // [Host] [A] [B] — host moves to left
  | 'HOST_RIGHT';          // [A] [B] [Host] — host moves to right

// Layout rotation order — changes every 90s to prevent boredom
const LAYOUT_SEQUENCE: PanelLayout[] = [
  'THREE_EQUAL',
  'A_FEATURED',
  'VS_MODE',
  'B_FEATURED',
  'HOST_LEFT',
  'THREE_EQUAL',
  'HOST_RIGHT',
  'A_FEATURED',
  'B_FEATURED',
  'VS_MODE',
];

const LAYOUT_DURATION_MS = 90_000; // 90 seconds per layout

interface GridSpec {
  cols: string;
  aOrder: number;
  hostOrder: number;
  bOrder: number;
  aFlex: number;
  hostFlex: number;
  bFlex: number;
  hostPip: boolean;
}

function getGridSpec(layout: PanelLayout): GridSpec {
  switch (layout) {
    case 'THREE_EQUAL':
      return { cols: '1fr 1fr 1fr', aOrder: 1, hostOrder: 2, bOrder: 3, aFlex: 1, hostFlex: 1, bFlex: 1, hostPip: false };
    case 'HOST_FEATURED':
      return { cols: '2fr 1fr 1fr', aOrder: 2, hostOrder: 1, bOrder: 3, aFlex: 1, hostFlex: 2, bFlex: 1, hostPip: false };
    case 'A_FEATURED':
      return { cols: '2fr 1fr 1fr', aOrder: 1, hostOrder: 2, bOrder: 3, aFlex: 2, hostFlex: 1, bFlex: 1, hostPip: false };
    case 'B_FEATURED':
      return { cols: '1fr 1fr 2fr', aOrder: 1, hostOrder: 2, bOrder: 3, aFlex: 1, hostFlex: 1, bFlex: 2, hostPip: false };
    case 'VS_MODE':
      return { cols: '1fr 1fr', aOrder: 1, hostOrder: 99, bOrder: 2, aFlex: 1, hostFlex: 0, bFlex: 1, hostPip: true };
    case 'HOST_LEFT':
      return { cols: '1fr 1fr 1fr', aOrder: 2, hostOrder: 1, bOrder: 3, aFlex: 1, hostFlex: 1, bFlex: 1, hostPip: false };
    case 'HOST_RIGHT':
      return { cols: '1fr 1fr 1fr', aOrder: 1, hostOrder: 3, bOrder: 2, aFlex: 1, hostFlex: 1, bFlex: 1, hostPip: false };
  }
}

const LABEL_MAP: Record<BattleEventType, { label: string; color: string; icon: string }> = {
  'battle':           { label: 'BATTLE',           color: '#FF2020', icon: '⚔️' },
  'cypher':           { label: 'CYPHER',            color: '#AA2DFF', icon: '🔄' },
  'challenge':        { label: 'CHALLENGE',         color: '#00E5FF', icon: '🎯' },
  'joke-off':         { label: 'JOKE-OFF',          color: '#FFD700', icon: '😂' },
  'dance-off':        { label: 'DANCE-OFF',         color: '#FF2DAA', icon: '💃' },
  'dirty-dozens':     { label: 'DIRTY DOZENS',      color: '#FF6B35', icon: '🔥' },
  'beat-battle':      { label: 'BEAT BATTLE',       color: '#00FFAA', icon: '🎹' },
  'producer-showcase':{ label: 'PRODUCER SHOWCASE', color: '#C0A0FF', icon: '🎛️' },
};

interface WinnerState {
  winnerId: string;
  phase: 'glow' | 'crown' | 'celebrate' | 'done';
}

interface Props {
  performerA: BattlePerformer;
  performerB: BattlePerformer;
  host?: BattleHost;
  eventType?: BattleEventType;
  roundLabel?: string;        // "ROUND 1", "FINAL ROUND", etc.
  timerLabel?: string;        // "2:34 remaining"
  showHost?: boolean;
  initialLayout?: PanelLayout;
  onWinner?: (winnerId: string) => void;
  winnerId?: string;          // pass to trigger end effects
}

function PerformerPanel({
  performer,
  isHost,
  accentColor,
  size,
  isWinner,
  isLoser,
  isCelebrating,
}: {
  performer: BattlePerformer | BattleHost;
  isHost: boolean;
  accentColor: string;
  size: 'normal' | 'featured' | 'small';
  isWinner: boolean;
  isLoser: boolean;
  isCelebrating: boolean;
}) {
  const h = size === 'featured' ? 360 : size === 'small' ? 200 : 280;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isLoser ? 0.35 : 1,
        scale: isWinner && isCelebrating ? 1.04 : isLoser ? 0.92 : 1,
        filter: isLoser ? 'grayscale(0.6)' : isWinner && isCelebrating ? `drop-shadow(0 0 32px ${accentColor})` : 'none',
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      style={{
        position: 'relative',
        height: h,
        borderRadius: 12,
        overflow: 'hidden',
        border: `2px solid ${isWinner && isCelebrating ? '#FFD700' : isHost ? 'rgba(255,255,255,0.15)' : `${accentColor}44`}`,
        boxShadow: isWinner && isCelebrating ? `0 0 60px rgba(255,215,0,0.5), 0 0 120px rgba(255,215,0,0.2)` : 'none',
        background: '#0a0614',
      }}
    >
      {/* Video feed or image */}
      {performer.videoStreamUrl ? (
        <video
          src={performer.videoStreamUrl}
          autoPlay
          muted
          playsInline
          loop
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img
          src={performer.profileImageUrl}
          alt={performer.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Gradient scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(5,3,16,0.92) 0%, transparent 55%)',
      }} />

      {/* Host badge */}
      {isHost && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
          borderRadius: 6, padding: '3px 10px',
          fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '.12em',
        }}>
          HOST
        </div>
      )}

      {/* Winner crown */}
      {isWinner && isCelebrating && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            fontSize: 36, zIndex: 10, filter: 'drop-shadow(0 0 20px #FFD700)',
          }}
        >
          👑
        </motion.div>
      )}

      {/* Name + score */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px', zIndex: 2 }}>
        <div style={{
          fontSize: size === 'small' ? 11 : 14, fontWeight: 900,
          color: isWinner && isCelebrating ? '#FFD700' : '#fff',
          letterSpacing: '.02em', marginBottom: 2,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>
          {performer.name}
        </div>
        {'score' in performer && performer.score != null && (
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: accentColor, letterSpacing: '.08em',
          }}>
            {performer.score.toLocaleString()} PTS
          </div>
        )}
        {'scriptLine' in performer && performer.scriptLine && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.3 }}>
            "{performer.scriptLine}"
          </div>
        )}
      </div>

      {/* "WINNER!" overlay */}
      {isWinner && isCelebrating && (
        <motion.div
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,215,0,0.1)',
          }}
        >
          <div style={{
            fontSize: 28, fontWeight: 900, color: '#FFD700',
            letterSpacing: '.2em', textShadow: '0 0 40px rgba(255,215,0,0.8)',
            fontFamily: 'var(--font-orbitron, monospace)',
          }}>
            WINNER!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function BattleSplitScreenPanel({
  performerA,
  performerB,
  host,
  eventType = 'battle',
  roundLabel,
  timerLabel,
  showHost = true,
  initialLayout = 'THREE_EQUAL',
  onWinner,
  winnerId,
}: Props) {
  const [layoutIdx, setLayoutIdx] = useState(0);
  const [prevLayout, setPrevLayout] = useState<PanelLayout>(initialLayout);
  const [currentLayout, setCurrentLayout] = useState<PanelLayout>(initialLayout);
  const [winner, setWinner] = useState<WinnerState | null>(null);
  const [autoRotating, setAutoRotating] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meta = LABEL_MAP[eventType];
  const spec = getGridSpec(currentLayout);

  // Auto-rotate layout every 90s — off when paused by user or after winner
  useEffect(() => {
    if (winner || !autoRotating) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setLayoutIdx(prev => {
        const next = (prev + 1) % LAYOUT_SEQUENCE.length;
        const nextLayout = LAYOUT_SEQUENCE[next]!;
        setPrevLayout(currentLayout);
        setCurrentLayout(nextLayout);
        return next;
      });
    }, LAYOUT_DURATION_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [winner, autoRotating, currentLayout]);

  // Winner end effects
  useEffect(() => {
    if (!winnerId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setWinner({ winnerId, phase: 'glow' });
    const t1 = setTimeout(() => setWinner({ winnerId, phase: 'crown' }), 800);
    const t2 = setTimeout(() => setWinner({ winnerId, phase: 'celebrate' }), 1800);
    const t3 = setTimeout(() => setWinner({ winnerId, phase: 'done' }), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [winnerId]);

  const isWinnerA = winner !== null && winner.winnerId === performerA.id;
  const isWinnerB = winner !== null && winner.winnerId === performerB.id;
  const isCelebrating = winner?.phase === 'crown' || winner?.phase === 'celebrate';

  const showVsPip = currentLayout === 'VS_MODE';
  const hasHost = showHost && !!host;

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>

      {/* ── Broadcast header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px',
        background: 'rgba(5,3,16,0.95)',
        borderBottom: `1px solid ${meta.color}33`,
      }}>
        {/* LIVE badge */}
        {!winner && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 8, fontWeight: 900, color: '#FF2020', letterSpacing: '.12em',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#FF2020', boxShadow: '0 0 6px #FF2020',
              animation: 'splitPulse 1s step-end infinite',
            }} />
            LIVE
          </span>
        )}
        {winner && (
          <span style={{ fontSize: 8, fontWeight: 900, color: '#FFD700', letterSpacing: '.12em' }}>
            🏆 EVENT ENDED
          </span>
        )}
        <span style={{
          fontSize: 9, fontWeight: 900, color: meta.color,
          background: `${meta.color}14`, border: `1px solid ${meta.color}44`,
          borderRadius: 4, padding: '2px 8px', letterSpacing: '.1em',
        }}>
          {meta.icon} {meta.label}
        </span>
        {roundLabel && (
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '.08em' }}>
            {roundLabel}
          </span>
        )}
        {timerLabel && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 900,
            color: '#00E5FF', fontFamily: 'var(--font-orbitron,monospace)',
          }}>
            ⏱ {timerLabel}
          </span>
        )}
        {/* Auto-rotate toggle */}
        {!winner && (
          <button
            onClick={() => setAutoRotating(r => !r)}
            title={autoRotating ? 'Pause auto layout rotation' : 'Resume auto layout rotation'}
            style={{
              fontSize: 8, fontWeight: 900, letterSpacing: '.08em',
              padding: '3px 9px', borderRadius: 4, cursor: 'pointer',
              border: `1px solid ${autoRotating ? '#00E5FF44' : 'rgba(255,255,255,0.18)'}`,
              background: autoRotating ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.06)',
              color: autoRotating ? '#00E5FF' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
              marginLeft: timerLabel ? 0 : 'auto',
            }}
          >
            {autoRotating ? '⏸ AUTO' : '▶ AUTO'}
          </button>
        )}
        {/* VS badge */}
        <span style={{
          fontSize: 11, fontWeight: 900,
          color: '#fff', letterSpacing: '.06em',
          padding: '2px 10px',
          background: 'linear-gradient(90deg,rgba(255,32,32,0.2),rgba(0,229,255,0.2))',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4,
          marginLeft: timerLabel ? 0 : 'auto',
        }}>
          {performerA.name} <span style={{ color: '#FF6B35' }}>VS</span> {performerB.name}
        </span>
      </div>

      {/* ── Main panel grid ── */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 180, damping: 28 }}
        style={{
          display: 'grid',
          gridTemplateColumns: showVsPip || !hasHost
            ? '1fr 1fr'
            : spec.cols,
          gap: 4,
          padding: 4,
          background: '#050310',
          position: 'relative',
        }}
      >
        {/* Performer A */}
        <motion.div layout style={{ order: spec.aOrder }}>
          <PerformerPanel
            performer={performerA}
            isHost={false}
            accentColor={meta.color}
            size={spec.aFlex >= 2 ? 'featured' : spec.aFlex === 0 ? 'small' : 'normal'}
            isWinner={isWinnerA}
            isLoser={!!winner && !isWinnerA && winner.phase !== 'glow'}
            isCelebrating={isCelebrating}
          />
        </motion.div>

        {/* Host (center position, hidden in VS_MODE as PIP) */}
        {hasHost && !showVsPip && (
          <motion.div layout style={{ order: spec.hostOrder }}>
            <PerformerPanel
              performer={host}
              isHost
              accentColor="rgba(255,255,255,0.5)"
              size="normal"
              isWinner={false}
              isLoser={false}
              isCelebrating={false}
            />
          </motion.div>
        )}

        {/* Performer B */}
        <motion.div layout style={{ order: spec.bOrder }}>
          <PerformerPanel
            performer={performerB}
            isHost={false}
            accentColor={meta.color}
            size={spec.bFlex >= 2 ? 'featured' : spec.bFlex === 0 ? 'small' : 'normal'}
            isWinner={isWinnerB}
            isLoser={!!winner && !isWinnerB && winner.phase !== 'glow'}
            isCelebrating={isCelebrating}
          />
        </motion.div>

        {/* VS_MODE — host as PIP overlay */}
        {hasHost && showVsPip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute', bottom: 20, left: '50%',
              transform: 'translateX(-50%)',
              width: 120, height: 90,
              borderRadius: 10,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.25)',
              boxShadow: '0 0 20px rgba(0,0,0,0.8)',
              zIndex: 10,
            }}
          >
            {host.videoStreamUrl ? (
              <video src={host.videoStreamUrl} autoPlay muted playsInline loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={host.profileImageUrl} alt={host.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 8, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
              {host.name} · HOST
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Layout label (broadcast lower-third) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLayout}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          style={{
            textAlign: 'center', padding: '5px 0',
            fontSize: 7, color: 'rgba(255,255,255,0.2)',
            letterSpacing: '.15em', fontWeight: 700,
            background: '#050310',
          }}
        >
          {currentLayout.replace(/_/g, ' ')}
        </motion.div>
      </AnimatePresence>

      {/* ── End effect: confetti burst overlay ── */}
      {winner && winner.phase === 'celebrate' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)',
          }}
        >
          {/* CSS particle burst */}
          <style>{`
            @keyframes confettiFall {
              0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(120%) rotate(720deg); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 0,
              left: `${(i / 18) * 100}%`,
              width: 8, height: 14,
              borderRadius: 2,
              background: ['#FFD700','#FF2DAA','#00E5FF','#AA2DFF','#FF6B35'][i % 5],
              animation: `confettiFall ${1.5 + Math.random() * 1.5}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.8}s`,
              opacity: 0,
            }} />
          ))}
        </motion.div>
      )}

      <style>{`
        @keyframes splitPulse { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
