'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { SpotlightPhase, SpotlightState } from '@/hooks/useSpotlight';

const ENERGY_COLORS: Record<string, { text: string; glow: string; label: string }> = {
  HIGH: { text: '#FF2DAA', glow: 'rgba(255,45,170,0.5)', label: '⚡ HIGH ENERGY' },
  MID:  { text: '#FFD700', glow: 'rgba(255,215,0,0.4)',  label: '🔥 ACTIVE' },
  LOW:  { text: '#00FFFF', glow: 'rgba(0,255,255,0.3)',  label: '🎧 LISTENING' },
};

function ScanBeam() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background:
          'conic-gradient(from 0deg, transparent 70%, rgba(0,255,255,0.6) 100%)',
        animation: 'spotlightScan 0.8s linear infinite',
      }}
    />
  );
}

function LockRing({ glowColor }: { glowColor: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        border: `2px solid ${glowColor}`,
        boxShadow: `0 0 12px ${glowColor}, 0 0 24px ${glowColor}`,
        animation: 'spotlightLockPulse 0.4s ease-out',
      }}
    />
  );
}

interface StageSpotlightWidgetProps {
  phase: SpotlightPhase;
  target: SpotlightState['target'];
  onClick?: () => void;
}

export function StageSpotlightWidget({ phase, target, onClick }: StageSpotlightWidgetProps) {
  const isVisible = phase === 'scanning' || phase === 'locked' || phase === 'revealed' || phase === 'fading';
  const energyMeta = ENERGY_COLORS[(target?.energy ?? 'LOW')] ?? ENERGY_COLORS.LOW!;
  const clickable = onClick !== undefined && phase === 'revealed';

  return (
    <>
      <style>{`
        @keyframes spotlightScan {
          from { transform: rotate(0deg) translateZ(0); }
          to   { transform: rotate(360deg) translateZ(0); }
        }
        @keyframes spotlightLockPulse {
          0%   { transform: scale(1.2) translateZ(0); opacity: 0; }
          60%  { transform: scale(1.0) translateZ(0); opacity: 1; }
          100% { transform: scale(1.0) translateZ(0); opacity: 1; }
        }
        @keyframes spotlightBeamDrop {
          0%   { opacity: 0; height: 0; }
          100% { opacity: 0.35; height: 120px; }
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="spotlight-widget"
            initial={{ opacity: 0, y: 16, scale: 0.88 }}
            animate={{
              opacity: phase === 'fading' ? 0 : 1,
              y: 0,
              scale: phase === 'revealed' ? 1 : 0.95,
            }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 96,
              left: 20,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 18px 12px 12px',
              borderRadius: 999,
              border: '1px solid rgba(0,255,255,0.28)',
              background: 'rgba(5,5,16,0.88)',
              backdropFilter: 'blur(12px)',
              boxShadow: phase === 'revealed'
                ? `0 0 28px ${energyMeta.glow}, 0 4px 24px rgba(0,0,0,0.6)`
                : '0 4px 20px rgba(0,0,0,0.5)',
              pointerEvents: clickable ? 'auto' : 'none',
              cursor: clickable ? 'pointer' : 'default',
              transition: 'box-shadow 0.4s ease',
            }}
            onClick={clickable ? onClick : undefined}
          >
            {/* Avatar ring */}
            <div
              style={{
                position: 'relative',
                width: 48,
                height: 48,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: `2px solid ${phase === 'revealed' ? energyMeta.text : 'rgba(0,255,255,0.5)'}`,
                  overflow: 'hidden',
                  background: 'rgba(0,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  transition: 'border-color 0.3s ease',
                }}
              >
                {target?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={target.avatar}
                    alt={target.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '🎧'
                )}
              </div>
              {phase === 'scanning' && <ScanBeam />}
              {phase === 'locked' && <LockRing glowColor={energyMeta.glow} />}
            </div>

            {/* Info */}
            <div style={{ minWidth: 0 }}>
              {phase === 'scanning' ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    color: '#00FFFF',
                    textTransform: 'uppercase',
                  }}
                >
                  SCANNING CROWD…
                </div>
              ) : phase === 'locked' ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    color: '#FFD700',
                    textTransform: 'uppercase',
                  }}
                >
                  TARGET LOCKED
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 140,
                    }}
                  >
                    {target?.name ?? '—'}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'rgba(0,255,255,0.75)',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      marginTop: 2,
                    }}
                  >
                    {target?.isNew ? '★ JUST JOINED · ' : ''}{target?.role ?? 'FAN'}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      color: energyMeta.text,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      marginTop: 1,
                      textShadow: `0 0 8px ${energyMeta.glow}`,
                    }}
                  >
                    {energyMeta.label}
                  </div>
                </>
              )}
            </div>

            {/* SPOTLIGHT label */}
            {(phase === 'revealed') && (
              <div
                style={{
                  position: 'absolute',
                  top: -18,
                  left: 12,
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: '0.22em',
                  color: 'rgba(255,215,0,0.85)',
                  textTransform: 'uppercase',
                }}
              >
                ✦ SPOTLIGHT{clickable ? ' · TAP TO VIEW' : ''}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
