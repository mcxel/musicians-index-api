'use client';
/**
 * Stage Curtain System
 * Animated split-curtain with full state machine for live show control.
 *
 * States: IDLE → CURTAIN_CLOSED → CURTAIN_OPENING → LIVE → CURTAIN_CLOSING → ENDED
 */
import { motion, AnimatePresence } from 'framer-motion';

export type StageState =
  | 'IDLE'
  | 'CURTAIN_CLOSED'
  | 'CURTAIN_OPENING'
  | 'LIVE'
  | 'CURTAIN_CLOSING'
  | 'ENDED';

interface StageCurtainProps {
  state: StageState;
  showTitle?: string;
  artistName?: string;
  children?: React.ReactNode; // content shown when LIVE
}

const FOLD_POSITIONS_LEFT  = [0.12, 0.28, 0.46, 0.64, 0.82];
const FOLD_POSITIONS_RIGHT = [0.10, 0.26, 0.44, 0.62, 0.80];

export default function StageCurtain({ state, showTitle, artistName, children }: StageCurtainProps) {
  const isClosed  = state === 'CURTAIN_CLOSED' || state === 'IDLE';
  const isOpening = state === 'CURTAIN_OPENING';
  const isLive    = state === 'LIVE';
  const isClosing = state === 'CURTAIN_CLOSING';
  const isEnded   = state === 'ENDED';

  // How far each curtain panel slides
  const leftX  = isClosed ? '0%' : isOpening ? '-48%' : isLive ? '-105%' : isClosing ? '-8%' : '-105%';
  const rightX = isClosed ? '0%' : isOpening ? '48%'  : isLive ? '105%'  : isClosing ? '8%'  : '105%';
  const dur    = isOpening || isClosing ? 1.8 : 0;

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: 400,
      overflow: 'hidden', background: '#050508', borderRadius: 12,
    }}>
      {/* Stage backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 85%, #1a0022 0%, #050508 65%)',
        zIndex: 0,
      }} />

      {/* Spotlight beams (only when LIVE) */}
      <AnimatePresence>
        {isLive && (
          <>
            {[
              { left: '20%', delay: 0,   color: 'rgba(255,200,80,0.07)' },
              { left: '50%', delay: 0.5, color: 'rgba(255,80,180,0.06)' },
              { left: '75%', delay: 0.3, color: 'rgba(0,200,255,0.07)'  },
            ].map((beam, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: beam.delay }}
                style={{
                  position: 'absolute', top: 0, left: beam.left,
                  width: 140, height: '100%', zIndex: 4,
                  background: `linear-gradient(180deg, ${beam.color} 0%, transparent 75%)`,
                  transformOrigin: 'top center',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── LEFT CURTAIN PANEL ── */}
      <motion.div
        animate={{ x: leftX }}
        transition={{ duration: dur, ease: [0.22, 0.1, 0.22, 1] }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '51%', zIndex: 10,
          background: 'linear-gradient(92deg, #6B0000 0%, #AA0000 35%, #CC0000 65%, #AA0000 85%, #800000 100%)',
          boxShadow: '6px 0 40px rgba(0,0,0,0.85)',
        }}
      >
        {/* Vertical fold lines */}
        {FOLD_POSITIONS_LEFT.map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${pos * 100}%`, width: 2,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.45) 100%)',
          }} />
        ))}
        {/* Sheen */}
        <div style={{
          position: 'absolute', top: 0, left: '30%', bottom: 0, width: '20%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        }} />
        {/* Right edge gold trim */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 8,
          background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 40%, #FFD700 70%, #B8860B 100%)',
          boxShadow: '0 0 12px rgba(255,215,0,0.4)',
        }} />
        {/* Top valance */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 28,
          background: 'linear-gradient(180deg, #4A0000 0%, #8B0000 100%)',
          borderBottom: '3px solid #FFD700',
          boxShadow: '0 3px 12px rgba(255,215,0,0.25)',
        }} />
      </motion.div>

      {/* ── RIGHT CURTAIN PANEL ── */}
      <motion.div
        animate={{ x: rightX }}
        transition={{ duration: dur, ease: [0.22, 0.1, 0.22, 1] }}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '51%', zIndex: 10,
          background: 'linear-gradient(268deg, #6B0000 0%, #AA0000 35%, #CC0000 65%, #AA0000 85%, #800000 100%)',
          boxShadow: '-6px 0 40px rgba(0,0,0,0.85)',
        }}
      >
        {FOLD_POSITIONS_RIGHT.map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${pos * 100}%`, width: 2,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.45) 100%)',
          }} />
        ))}
        <div style={{
          position: 'absolute', top: 0, right: '30%', bottom: 0, width: '20%',
          background: 'linear-gradient(270deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        }} />
        {/* Left edge gold trim */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 8,
          background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 40%, #FFD700 70%, #B8860B 100%)',
          boxShadow: '0 0 12px rgba(255,215,0,0.4)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 28,
          background: 'linear-gradient(180deg, #4A0000 0%, #8B0000 100%)',
          borderBottom: '3px solid #FFD700',
          boxShadow: '0 3px 12px rgba(255,215,0,0.25)',
        }} />
      </motion.div>

      {/* ── STAGE CONTENT AREA ── */}
      <div style={{ position: 'relative', zIndex: 5, minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <AnimatePresence mode="wait">

          {/* CLOSED / IDLE — show title card on curtain */}
          {(isClosed) && (
            <motion.div key="closed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', zIndex: 15 }}
            >
              {showTitle && (
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 4, color: 'rgba(255,215,0,0.9)', textShadow: '0 0 30px rgba(255,215,0,0.5)', marginBottom: 8 }}>
                  {showTitle}
                </div>
              )}
              {artistName && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 }}>
                  {artistName}
                </div>
              )}
              <div style={{ marginTop: 20, fontSize: 9, color: 'rgba(255,215,0,0.4)', letterSpacing: 4 }}>
                DOORS OPENING SOON
              </div>
            </motion.div>
          )}

          {/* OPENING — countdown/transition */}
          {isOpening && (
            <motion.div key="opening"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', zIndex: 15 }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
                style={{ fontSize: 16, fontWeight: 900, letterSpacing: 6, color: '#FFD700', textShadow: '0 0 40px rgba(255,215,0,0.6)' }}
              >
                OPENING…
              </motion.div>
            </motion.div>
          )}

          {/* LIVE — full content */}
          {isLive && (
            <motion.div key="live"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 10, fontWeight: 900, letterSpacing: 5, color: '#FF2DAA', marginBottom: 16 }}
              >
                ● LIVE NOW
              </motion.div>
              {showTitle && (
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: '#fff', marginBottom: 6, textShadow: '0 0 20px rgba(255,45,170,0.4)' }}>
                  {showTitle}
                </div>
              )}
              {artistName && (
                <div style={{ fontSize: 13, color: '#FFD700', fontWeight: 700, letterSpacing: 2, marginBottom: 24 }}>
                  {artistName}
                </div>
              )}
              {children}
            </motion.div>
          )}

          {/* CLOSING */}
          {isClosing && (
            <motion.div key="closing"
              initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', zIndex: 15 }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 4, color: 'rgba(255,255,255,0.6)' }}>
                SHOW CLOSING…
              </div>
            </motion.div>
          )}

          {/* ENDED */}
          {isEnded && (
            <motion.div key="ended"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', zIndex: 15 }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 5, color: '#444', marginBottom: 8 }}>
                SHOW ENDED
              </div>
              {showTitle && (
                <div style={{ fontSize: 14, color: '#333', fontWeight: 600 }}>{showTitle}</div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Stage floor gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, zIndex: 8,
        background: 'linear-gradient(0deg, rgba(100,0,0,0.1) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
