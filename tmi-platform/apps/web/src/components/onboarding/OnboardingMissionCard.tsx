'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export interface OnboardingMission {
  id: string;
  emoji: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor?: string;
}

interface Props {
  mission: OnboardingMission;
  /** Index in the queue (e.g. "1 of 4") */
  index: number;
  total: number;
  onDismiss: (id: string) => void;
  /** Auto-dismiss after this many ms. Default 9000. */
  autoDismissMs?: number;
}

export default function OnboardingMissionCard({ mission, index, total, onDismiss, autoDismissMs = 9000 }: Props) {
  const [progress, setProgress] = useState(0);
  const accent = mission.accentColor ?? '#00FFFF';

  // Animate the progress bar and auto-dismiss
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / autoDismissMs) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        onDismiss(mission.id);
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mission.id, autoDismissMs, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{
        position: 'fixed',
        bottom: 88,
        left: 20,
        zIndex: 9000,
        width: 300,
        background: 'rgba(5,5,16,0.97)',
        border: `1.5px solid ${accent}44`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Pulse accent bar at top */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />

      <div style={{ padding: '14px 16px 10px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{mission.emoji}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{mission.headline}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
                Step {index + 1} of {total}
              </div>
            </div>
          </div>
          <button
            onClick={() => onDismiss(mission.id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {/* Subtext */}
        <p style={{ margin: '0 0 10px', fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          {mission.subtext}
        </p>

        {/* CTA */}
        <Link
          href={mission.ctaHref}
          onClick={() => onDismiss(mission.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `${accent}18`,
            border: `1px solid ${accent}44`,
            borderRadius: 8,
            padding: '7px 10px',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 800, color: accent, letterSpacing: '0.06em' }}>
            {mission.ctaLabel}
          </span>
          <span style={{ color: accent, fontSize: 12 }}>→</span>
        </Link>
      </div>

      {/* Auto-dismiss progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${100 - progress}%`, background: `${accent}66`, transition: 'width 0.1s linear' }} />
      </div>
    </motion.div>
  );
}


interface DockProps {
  missions: OnboardingMission[];
  /** Called whenever a card is dismissed — use to persist to localStorage. */
  onDismiss?: (id: string) => void;
  onAllDismissed?: () => void;
}

/** Renders the mission queue one card at a time */
export function OnboardingMissionDock({ missions, onDismiss, onAllDismissed }: DockProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const pending = missions.filter(m => !dismissed.has(m.id));
  const current = pending[0] ?? null;

  function handleDismiss(id: string) {
    onDismiss?.(id);
    setDismissed(prev => {
      const next = new Set(prev).add(id);
      if (missions.every(m => next.has(m.id))) onAllDismissed?.();
      return next;
    });
  }

  return (
    <AnimatePresence mode="wait">
      {current && (
        <OnboardingMissionCard
          key={current.id}
          mission={current}
          index={missions.indexOf(current)}
          total={missions.length}
          onDismiss={handleDismiss}
        />
      )}
    </AnimatePresence>
  );
}
