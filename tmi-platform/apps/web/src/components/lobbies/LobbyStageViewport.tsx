'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type LobbyStageViewportProps = {
  title?: string;
  roomName?: string;
  countdownSeconds?: number;
  activeUsers?: number;
  vipUsers?: number;
  queueDepth?: number;
  occupancyPercent?: number;
  performerName?: string;
  countryFlag?: string;
  membershipTier?: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'STANDARD';
  fanCount?: number;
  isLive?: boolean;
  videoSrc?: string;
  accentColor?: string;
  reactionPulseId?: number;
  hypePulseId?: number;
};

function tierStyle(tier: LobbyStageViewportProps['membershipTier']): { border: string; glow: string } {
  if (tier === 'DIAMOND') {
    return {
      border: '1px solid rgba(0,255,255,0.85)',
      glow: '0 0 30px rgba(0,255,255,0.45), inset 0 0 28px rgba(0,255,255,0.1)',
    };
  }
  if (tier === 'PLATINUM') {
    return {
      border: '1px solid rgba(255,215,0,0.85)',
      glow: '0 0 30px rgba(255,215,0,0.45), inset 0 0 28px rgba(255,215,0,0.1)',
    };
  }
  return {
    border: '1px solid rgba(255,255,255,0.22)',
    glow: '0 0 16px rgba(0,0,0,0.45)',
  };
}

export default function LobbyStageViewport({
  title,
  roomName,
  countdownSeconds,
  activeUsers,
  vipUsers,
  queueDepth,
  occupancyPercent,
  performerName,
  countryFlag = '🌐',
  membershipTier = 'STANDARD',
  fanCount,
  isLive = true,
  videoSrc,
  accentColor = '#FF2DAA',
  reactionPulseId = 0,
  hypePulseId = 0,
}: LobbyStageViewportProps) {
  const [tipBurst, setTipBurst] = useState(false);
  const [hypeRipple, setHypeRipple] = useState(false);
  const [fanPulse, setFanPulse] = useState(false);

  const resolvedTitle = title ?? roomName ?? 'Stage';
  const resolvedPerformer = performerName ?? 'Live Performer';
  const watchers = fanCount ?? activeUsers ?? 0;
  const visualTier = useMemo(() => tierStyle(membershipTier), [membershipTier]);
  const previousFanCount = useRef<number>(watchers);

  useEffect(() => {
    if (reactionPulseId === 0) return;
    setTipBurst(true);
    const t = window.setTimeout(() => setTipBurst(false), 1200);
    return () => window.clearTimeout(t);
  }, [reactionPulseId]);

  useEffect(() => {
    if (hypePulseId === 0) return;
    setHypeRipple(true);
    const t = window.setTimeout(() => setHypeRipple(false), 700);
    return () => window.clearTimeout(t);
  }, [hypePulseId]);

  useEffect(() => {
    if (watchers > previousFanCount.current) {
      setFanPulse(true);
      const t = window.setTimeout(() => setFanPulse(false), 900);
      previousFanCount.current = watchers;
      return () => window.clearTimeout(t);
    }
    previousFanCount.current = watchers;
  }, [watchers]);

  return (
    <section
      aria-label="Lobby stage viewport"
      role="region"
      tabIndex={0}
      data-runtime="lobby-stage-viewport"
      data-telemetry="lobby.stage.render"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        minHeight: 260,
        borderRadius: 14,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #010108 0%, #06040e 60%, #0a060e 100%)',
        border: visualTier.border,
        boxShadow: visualTier.glow,
      }}
    >
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 0%, ${accentColor}18 0%, transparent 60%), linear-gradient(180deg, #050310 0%, #080410 100%)`,
            }}
          />
          <motion.div
            animate={tipBurst ? { opacity: [0.8, 1, 0.8] } : { opacity: [0.52, 0.8, 0.52] }}
            transition={{ duration: tipBurst ? 0.5 : 3.2, repeat: tipBurst ? 0 : Infinity }}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: hypeRipple ? 300 : 250,
              height: '100%',
              background: `radial-gradient(ellipse at 50% 0%, ${accentColor}30 0%, transparent 65%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: 20,
            }}
          >
            {isLive ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 10, filter: `drop-shadow(0 0 12px ${accentColor})` }}>🎤</div>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
                  {resolvedPerformer}
                </div>
                <div style={{ fontSize: 10, marginTop: 4, color: 'rgba(255,255,255,0.56)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  {resolvedTitle}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                Live performance starting soon
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.68), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{countryFlag}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: membershipTier === 'DIAMOND' ? '#00FFFF' : membershipTier === 'PLATINUM' ? '#FFD700' : 'rgba(255,255,255,0.72)',
            }}
          >
            {membershipTier}
          </span>
          {isLive ? (
            <>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3333' }}
              />
              <span style={{ fontSize: 9, fontWeight: 900, color: '#FF3333', letterSpacing: '0.2em', textTransform: 'uppercase' }}>LIVE</span>
            </>
          ) : (
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>PRE-SHOW</span>
          )}
          {typeof countdownSeconds === 'number' && countdownSeconds > 0 && (
            <span style={{ fontSize: 9, color: accentColor, fontFamily: 'monospace' }}>
              {String(Math.floor(countdownSeconds / 60)).padStart(2, '0')}:{String(countdownSeconds % 60).padStart(2, '0')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: fanPulse ? '#00FFFF' : 'rgba(255,255,255,0.78)',
              textShadow: fanPulse ? '0 0 12px rgba(0,255,255,0.8)' : 'none',
              transition: 'color 0.2s ease, text-shadow 0.2s ease',
            }}
          >
            {watchers.toLocaleString()} fans watching
          </span>
          {typeof vipUsers === 'number' && vipUsers > 0 && (
            <span style={{ fontSize: 9, color: accentColor }}>⭐ {vipUsers} VIP</span>
          )}
          {typeof occupancyPercent === 'number' && (
            <span style={{ fontSize: 9, color: occupancyPercent >= 80 ? '#FF3333' : 'rgba(255,255,255,0.45)' }}>
              {occupancyPercent}% full
            </span>
          )}
        </div>
      </div>

      {typeof queueDepth === 'number' && queueDepth > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: '6px 12px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.75), transparent)',
            fontSize: 9,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {queueDepth} performer{queueDepth !== 1 ? 's' : ''} in queue
        </div>
      )}
    </section>
  );
}
