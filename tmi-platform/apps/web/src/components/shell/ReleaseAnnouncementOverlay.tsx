'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type ReleaseAnnouncementKind =
  | 'album'
  | 'single'
  | 'video'
  | 'magazine'
  | 'tickets'
  | 'merch'
  | 'premiere'
  | 'sponsor';

export type ReleaseAnnouncementPhase =
  | 'applause'
  | 'thanks'
  | 'reveal'
  | 'cta'
  | 'closing';

export interface ReleaseAnnouncementItem {
  id: string;
  kind: ReleaseAnnouncementKind;
  title: string;
  subtitle?: string;
  href?: string;
  artLabel?: string;
}

interface ReleaseAnnouncementOverlayProps {
  visible: boolean;
  phase: ReleaseAnnouncementPhase;
  mode: 'end-show' | 'showcase';
  item: ReleaseAnnouncementItem | null;
  accentColor?: string;
  onAction?: (action: 'listen' | 'view' | 'save' | 'share', item: ReleaseAnnouncementItem) => void;
}

const PHASE_COPY: Record<ReleaseAnnouncementPhase, { title: string; subtitle: string }> = {
  applause: {
    title: 'Audience Applauding',
    subtitle: 'The curtain starts to close as the crowd celebrates the performance.',
  },
  thanks: {
    title: 'Thank You For Watching!',
    subtitle: 'Stay connected to the performer ecosystem for what is next.',
  },
  reveal: {
    title: 'Now Available',
    subtitle: 'A new release just dropped on stage.',
  },
  cta: {
    title: 'OUT NOW',
    subtitle: 'Tap an action to continue into the artist story, media, and upcoming shows.',
  },
  closing: {
    title: 'Curtain Closing',
    subtitle: 'Returning everyone to the lobby in a moment.',
  },
};

export default function ReleaseAnnouncementOverlay({
  visible,
  phase,
  mode,
  item,
  accentColor = '#00FFFF',
  onAction,
}: ReleaseAnnouncementOverlayProps) {
  const canShowCard = Boolean(item) && (phase === 'reveal' || phase === 'cta' || (mode === 'showcase' && phase !== 'closing'));

  return (
    <AnimatePresence>
      {visible && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at center, rgba(8,10,24,0.42) 0%, rgba(2,2,8,0.84) 76%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <style>{`
            @keyframes tmiMusicDust {
              0% { transform: translate3d(0, 0, 0) scale(0.9); opacity: 0; }
              20% { opacity: 0.8; }
              100% { transform: translate3d(var(--dx), -120px, 0) scale(1.2); opacity: 0; }
            }
            @keyframes tmiSweep {
              0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
              18% { opacity: 0.4; }
              100% { transform: translateX(210%) skewX(-18deg); opacity: 0; }
            }
          `}</style>

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `${8 + (i * 5) % 82}%`,
                  bottom: `${10 + (i * 2) % 25}%`,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF2DAA' : accentColor,
                  opacity: 0,
                  filter: 'blur(0.2px)',
                  animation: `tmiMusicDust ${2 + (i % 4) * 0.35}s ease-out infinite`,
                  animationDelay: `${i * 0.14}s`,
                  ['--dx' as string]: `${(i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 6)}px`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            style={{
              textAlign: 'center',
              marginBottom: canShowCard ? 16 : 0,
            }}
          >
            <div style={{
              fontSize: 12,
              letterSpacing: '0.2em',
              fontWeight: 900,
              color: phase === 'cta' ? '#FFD700' : accentColor,
              textTransform: 'uppercase',
              marginBottom: 6,
              textShadow: '0 0 16px rgba(0,0,0,0.75)',
            }}>
              {PHASE_COPY[phase].title}
            </div>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.84)',
              letterSpacing: '0.03em',
            }}>
              {PHASE_COPY[phase].subtitle}
            </div>
          </motion.div>

          {canShowCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, rotate: -12, y: 18 }}
              animate={{ opacity: 1, scale: 1, rotate: -2, y: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              style={{
                width: 440,
                maxWidth: 'calc(100vw - 32px)',
                borderRadius: 16,
                border: `1px solid ${accentColor}66`,
                background: 'rgba(6,8,22,0.9)',
                boxShadow: `0 22px 54px rgba(0,0,0,0.72), 0 0 36px ${accentColor}30`,
                padding: 14,
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at center, ${accentColor}18 0%, transparent 62%)`,
                  filter: 'blur(0.2px)',
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  left: -100,
                  width: 160,
                  height: 240,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                  animation: 'tmiSweep 2.3s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <motion.div
                  animate={{ y: [0, -4, 0], rotate: [-2, -1, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: 12,
                    border: `1px solid ${accentColor}88`,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,255,255,0.06))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                    boxShadow: `0 0 18px ${accentColor}38`,
                    flexShrink: 0,
                  }}
                >
                  {kindGlyph(item.kind)}
                </motion.div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 9,
                      color: accentColor,
                      border: `1px solid ${accentColor}55`,
                      borderRadius: 999,
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                      fontWeight: 800,
                    }}>
                      {kindLabel(item.kind)}
                    </span>
                    {phase === 'cta' && (
                      <motion.span
                        initial={{ scale: 0.7, rotate: -9, opacity: 0 }}
                        animate={{ scale: 1, rotate: -6, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                        style={{
                          marginLeft: 'auto',
                          fontSize: 11,
                          fontWeight: 900,
                          color: '#FFD700',
                          border: '1px solid rgba(255,215,0,0.58)',
                          background: 'rgba(255,215,0,0.12)',
                          padding: '2px 8px',
                          borderRadius: 6,
                          letterSpacing: '0.08em',
                        }}
                      >
                        OUT NOW
                      </motion.span>
                    )}
                  </div>

                  <div style={{
                    marginTop: 8,
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#fff',
                    lineHeight: 1.25,
                    letterSpacing: '0.02em',
                  }}>
                    {item.title}
                  </div>

                  {item.subtitle && (
                    <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.72)', fontSize: 11 }}>
                      {item.subtitle}
                    </div>
                  )}

                  {item.artLabel && (
                    <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
                      {item.artLabel}
                    </div>
                  )}
                </div>
              </div>

              {(phase === 'cta' || mode === 'showcase') && (
                <div style={{
                  marginTop: 12,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 6,
                }}>
                  <ActionButton label={primaryLabel(item.kind)} onClick={() => onAction?.('listen', item)} tone={accentColor} />
                  <ActionButton label={secondaryLabel(item.kind)} onClick={() => onAction?.('view', item)} />
                  <ActionButton label='Save' onClick={() => onAction?.('save', item)} />
                  <ActionButton label='Share' onClick={() => onAction?.('share', item)} />
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionButton({ label, onClick, tone }: { label: string; onClick: () => void; tone?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 8,
        border: `1px solid ${tone ? `${tone}66` : 'rgba(255,255,255,0.2)'}`,
        background: tone ? `${tone}1d` : 'rgba(255,255,255,0.06)',
        color: tone ?? 'rgba(255,255,255,0.86)',
        padding: '7px 8px',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function kindLabel(kind: ReleaseAnnouncementKind): string {
  switch (kind) {
    case 'album': return 'Album Release';
    case 'single': return 'New Single';
    case 'video': return 'Music Video';
    case 'magazine': return 'Magazine';
    case 'tickets': return 'Concert Tickets';
    case 'merch': return 'Merchandise';
    case 'premiere': return 'World Premiere';
    case 'sponsor': return 'Sponsored';
  }
}

function kindGlyph(kind: ReleaseAnnouncementKind): string {
  switch (kind) {
    case 'album': return '💿';
    case 'single': return '🎵';
    case 'video': return '🎥';
    case 'magazine': return '📰';
    case 'tickets': return '🎟';
    case 'merch': return '👕';
    case 'premiere': return '🎤';
    case 'sponsor': return '📢';
  }
}

function primaryLabel(kind: ReleaseAnnouncementKind): string {
  if (kind === 'tickets') return 'Buy Now';
  if (kind === 'merch') return 'Shop';
  if (kind === 'magazine') return 'Read';
  return 'Listen';
}

function secondaryLabel(kind: ReleaseAnnouncementKind): string {
  if (kind === 'video') return 'Watch';
  if (kind === 'magazine') return 'View Story';
  if (kind === 'tickets') return 'View Event';
  if (kind === 'merch') return 'View Drop';
  return 'View Album';
}
