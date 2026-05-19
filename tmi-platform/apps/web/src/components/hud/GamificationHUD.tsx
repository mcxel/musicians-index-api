'use client';
import { useEffect, useRef, useState } from 'react';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';

interface Gain { xp: number; credits: number; id: number; tier: 'sm' | 'md' | 'rare' }
interface LevelUpDetail { level: number; xp: number }

let _toastId = 0;

function gainTier(xp: number): Gain['tier'] {
  if (xp >= 60) return 'rare';
  if (xp >= 20) return 'md';
  return 'sm';
}

const TIER_STYLE: Record<Gain['tier'], React.CSSProperties> = {
  sm: {
    background: 'rgba(5,5,16,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    fontSize: 10,
    padding: '4px 12px',
  },
  md: {
    background: 'rgba(5,5,16,0.94)',
    border: '1px solid rgba(0,255,136,0.35)',
    fontSize: 11,
    padding: '5px 14px',
    boxShadow: '0 0 12px rgba(0,255,136,0.12)',
  },
  rare: {
    background: 'linear-gradient(90deg,rgba(170,45,255,0.18),rgba(5,5,16,0.96))',
    border: '1px solid rgba(170,45,255,0.6)',
    fontSize: 12,
    padding: '6px 16px',
    boxShadow: '0 0 20px rgba(170,45,255,0.25)',
    animation: 'tmi-toast-rare 0.3s ease-out',
  },
};

export default function GamificationHUD() {
  const { totalXp, walletCredits, currentLevel, progress } = useGamificationEngine();

  const [toasts, setToasts] = useState<Gain[]>([]);
  const [levelUp, setLevelUp] = useState<LevelUpDetail | null>(null);

  const prevXp = useRef(totalXp);
  const prevCredits = useRef(walletCredits);
  const mounted = useRef(false);

  // Detect gains — skip first hydration cycle
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevXp.current = totalXp;
      prevCredits.current = walletCredits;
      return;
    }
    const xpDiff = totalXp - prevXp.current;
    const crDiff = walletCredits - prevCredits.current;
    if (xpDiff > 0 || crDiff > 0) {
      const tier = gainTier(xpDiff);
      const id = ++_toastId;
      const holdMs = tier === 'rare' ? 4000 : tier === 'md' ? 2800 : 2000;
      setToasts(prev => [...prev, { xp: xpDiff, credits: crDiff, id, tier }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), holdMs);
    }
    prevXp.current = totalXp;
    prevCredits.current = walletCredits;
  }, [totalXp, walletCredits]);

  // Level-up event
  useEffect(() => {
    function onLevelUp(e: Event) {
      const detail = (e as CustomEvent<LevelUpDetail>).detail;
      setLevelUp(detail);
      setTimeout(() => setLevelUp(null), 3200);
    }
    window.addEventListener('tmi:level-up', onLevelUp);
    return () => window.removeEventListener('tmi:level-up', onLevelUp);
  }, []);

  // Progress strip thresholds
  const pct = progress.pct;
  const showStrip = progress.nextLevel && pct >= 75;
  const stripPulse = pct >= 85;
  const stripUrgent = pct >= 95;

  return (
    <>
      {/* Floating gain toasts */}
      <div style={{ position: 'fixed', bottom: 72, right: 20, zIndex: 9998, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            borderRadius: 20,
            fontWeight: 800,
            color: '#fff',
            display: 'flex',
            gap: 10,
            backdropFilter: 'blur(10px)',
            animation: t.tier === 'rare' ? 'tmi-toast-rare 0.3s ease-out' : 'tmi-toast-in 0.22s ease-out',
            ...TIER_STYLE[t.tier],
          }}>
            {t.tier === 'rare' && <span style={{ color: '#AA2DFF', fontSize: 13 }}>✦</span>}
            {t.xp > 0 && <span style={{ color: t.tier === 'rare' ? '#CC88FF' : '#FFD700' }}>+{t.xp} XP</span>}
            {t.credits > 0 && <span style={{ color: '#00FF88' }}>+{t.credits} cr</span>}
          </div>
        ))}
      </div>

      {/* Level-up flash */}
      {levelUp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #AA2DFF22 0%, #050510 100%)',
            border: '1px solid #AA2DFF66',
            borderRadius: 20,
            padding: '32px 48px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(170,45,255,0.35)',
            animation: 'tmi-levelup-in 0.35s ease-out',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>LEVEL UP</div>
            <div style={{ fontSize: 44, marginBottom: 4 }}>{currentLevel.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>Level {levelUp.level}</div>
            <div style={{ fontSize: 13, color: '#AA2DFF', fontWeight: 700, marginTop: 4 }}>{currentLevel.title}</div>
          </div>
        </div>
      )}

      {/* Progress strip */}
      {showStrip && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
          background: 'rgba(5,5,16,0.92)',
          borderTop: `1px solid ${stripUrgent ? 'rgba(255,213,0,0.5)' : 'rgba(255,213,0,0.18)'}`,
          padding: '7px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none',
          animation: stripPulse ? 'tmi-strip-pulse 1.8s ease-in-out infinite' : undefined,
        }}>
          <span style={{
            fontSize: stripUrgent ? 10 : 9,
            color: stripUrgent ? '#FFD700' : 'rgba(255,213,0,0.8)',
            fontWeight: 800,
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
          }}>
            {stripUrgent
              ? `${progress.nextLevel!.icon} YOU'RE ONE ACTION AWAY — Level ${progress.nextLevel!.level}`
              : `${progress.nextLevel!.icon} ${progress.needed} XP to Level ${progress.nextLevel!.level}`}
          </span>
          <div style={{ flex: 1, height: stripUrgent ? 4 : 3, background: 'rgba(255,213,0,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: stripUrgent ? '#FFD700' : 'linear-gradient(90deg,#FFD700,#FF9500)',
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,213,0,0.5)', whiteSpace: 'nowrap' }}>{Math.round(pct)}%</span>
        </div>
      )}

      <style>{`
        @keyframes tmi-toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tmi-toast-rare {
          0%   { opacity: 0; transform: translateY(10px) scale(0.85); }
          60%  { transform: translateY(-2px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tmi-levelup-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes tmi-strip-pulse {
          0%, 100% { border-top-color: rgba(255,213,0,0.18); }
          50%      { border-top-color: rgba(255,213,0,0.55); }
        }
      `}</style>
    </>
  );
}
