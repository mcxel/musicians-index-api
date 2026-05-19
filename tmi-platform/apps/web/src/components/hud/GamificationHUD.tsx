'use client';
import { useEffect, useRef, useState } from 'react';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';

interface Gain { xp: number; credits: number; id: number }
interface LevelUpDetail { level: number; xp: number }

let _toastId = 0;

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
      const id = ++_toastId;
      setToasts(prev => [...prev, { xp: xpDiff, credits: crDiff, id }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
    }
    prevXp.current = totalXp;
    prevCredits.current = walletCredits;
  }, [totalXp, walletCredits]);

  // Listen for level-up event
  useEffect(() => {
    function onLevelUp(e: Event) {
      const detail = (e as CustomEvent<LevelUpDetail>).detail;
      setLevelUp(detail);
      setTimeout(() => setLevelUp(null), 3200);
    }
    window.addEventListener('tmi:level-up', onLevelUp);
    return () => window.removeEventListener('tmi:level-up', onLevelUp);
  }, []);

  return (
    <>
      {/* Floating gain toasts — bottom right */}
      <div style={{ position: 'fixed', bottom: 72, right: 20, zIndex: 9998, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'rgba(5,5,16,0.92)',
            border: '1px solid rgba(0,255,136,0.35)',
            borderRadius: 20,
            padding: '5px 14px',
            fontSize: 11,
            fontWeight: 800,
            color: '#fff',
            display: 'flex',
            gap: 10,
            animation: 'tmi-toast-in 0.25s ease-out',
            backdropFilter: 'blur(8px)',
          }}>
            {t.xp > 0 && <span style={{ color: '#FFD700' }}>+{t.xp} XP</span>}
            {t.credits > 0 && <span style={{ color: '#00FF88' }}>+{t.credits} cr</span>}
          </div>
        ))}
      </div>

      {/* Level-up flash — center screen */}
      {levelUp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
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

      {/* Progress strip — only when 75%+ to next level and next level exists */}
      {progress.nextLevel && progress.pct >= 75 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
          background: 'rgba(5,5,16,0.88)',
          borderTop: '1px solid rgba(255,213,0,0.2)',
          padding: '7px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 9, color: '#FFD700', fontWeight: 800, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            {progress.nextLevel.icon} {progress.needed} XP to Level {progress.nextLevel.level}
          </span>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,213,0,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress.pct}%`, background: 'linear-gradient(90deg,#FFD700,#FF9500)', borderRadius: 2, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,213,0,0.5)', whiteSpace: 'nowrap' }}>{Math.round(progress.pct)}%</span>
        </div>
      )}

      <style>{`
        @keyframes tmi-toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tmi-levelup-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
