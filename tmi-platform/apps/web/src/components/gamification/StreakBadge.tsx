'use client';

import { useEffect, useState } from 'react';

interface StreakData {
  current: number;
  longest: number;
  isNewDay: boolean;
  multiplier: number;
  xpGranted: number;
}

function readLocalStreak(): StreakData | null {
  try {
    const raw = localStorage.getItem('tmi_streak');
    if (!raw) return null;
    return JSON.parse(raw) as StreakData;
  } catch {
    return null;
  }
}

function multiplierLabel(m: number): string {
  if (m <= 1) return '';
  return `+${Math.round((m - 1) * 100)}% XP`;
}

function streakMessage(streak: number): string {
  if (streak >= 7) return "🏆 WEEK WARRIOR — keep it going";
  if (streak >= 5) return "🔥 ON FIRE — 2× XP active";
  if (streak >= 3) return "⚡ Streak locked in";
  if (streak >= 2) return "Come back tomorrow to grow it";
  return "Come back tomorrow to grow it";
}

export default function StreakBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show on login event
    function onStreakEvent(e: Event) {
      const detail = (e as CustomEvent<StreakData>).detail;
      if (detail?.current > 0 && detail.isNewDay) {
        setStreak(detail);
        setVisible(true);
        setDismissed(false);
        // Auto-dismiss after 6s
        setTimeout(() => setVisible(false), 6000);
      }
    }
    window.addEventListener('tmi:streak', onStreakEvent);
    return () => window.removeEventListener('tmi:streak', onStreakEvent);
  }, []);

  // Restore chip from localStorage on mount (for session continuity)
  useEffect(() => {
    const s = readLocalStreak();
    if (s && s.current > 0) {
      setStreak(s);
    }
  }, []);

  if (!streak || streak.current === 0) return null;

  const bonus = multiplierLabel(streak.multiplier);
  const isSpecial = streak.current >= 7;
  const accent = isSpecial ? '#FFD700' : streak.current >= 3 ? '#FF2DAA' : '#FF6B2B';

  // Full toast (on new day login)
  if (visible && !dismissed) {
    return (
      <>
        <style>{`
          @keyframes streakSlideIn {
            from { opacity: 0; transform: translateY(16px) scale(0.94); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes streakPulse {
            0%, 100% { box-shadow: 0 0 16px ${accent}33; }
            50%       { box-shadow: 0 0 32px ${accent}66; }
          }
        `}</style>
        <div style={{
          position: 'fixed', bottom: 88, right: 20, zIndex: 9997,
          background: '#0a0a1a',
          border: `1.5px solid ${accent}66`,
          borderRadius: 14,
          padding: '16px 20px',
          maxWidth: 260,
          animation: 'streakSlideIn 0.28s ease-out, streakPulse 2s ease-in-out 0.3s infinite',
          cursor: 'pointer',
        }} onClick={() => { setVisible(false); setDismissed(true); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 26 }}>🔥</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: accent, lineHeight: 1 }}>
                {streak.current} Day Streak
              </div>
              {bonus && (
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#00FF88', marginTop: 2 }}>
                  {bonus} ACTIVE
                </div>
              )}
            </div>
            {streak.xpGranted > 0 && (
              <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 900, color: '#FFD700', background: 'rgba(255,213,0,0.1)', border: '1px solid rgba(255,213,0,0.3)', borderRadius: 6, padding: '3px 8px' }}>
                +{streak.xpGranted} XP
              </div>
            )}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
            {streakMessage(streak.current)}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setVisible(false); setDismissed(true); }}
            style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}
            aria-label="Dismiss streak toast"
          >×</button>
        </div>
      </>
    );
  }

  // Compact persistent chip (always visible when streak > 1)
  if (streak.current > 1) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: `${accent}18`,
        border: `1px solid ${accent}44`,
        borderRadius: 20,
        padding: '3px 10px',
        fontSize: 10,
        fontWeight: 800,
        color: accent,
        cursor: 'default',
        letterSpacing: '0.04em',
      }}>
        🔥 {streak.current}
      </div>
    );
  }

  return null;
}
