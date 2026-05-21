/**
 * WinnerLineupStrip.tsx
 * Repo: apps/web/src/components/contest/WinnerLineupStrip.tsx
 * Action: CREATE | Wave: A8
 * Purpose: Horizontal strip showing all revealed winners with rank badges.
 * Used in group reveal phase before hero zoom.
 */
'use client';
import type { RevealWinner } from './WinnerRevealPanel';

interface WinnerLineupStripProps {
  winners: RevealWinner[];
  activeRank?: number;
  compact?: boolean;
  allowVoiceChatter?: boolean;
  muted?: boolean;
}

const RANK_COLORS: Record<number, string> = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
const RANK_EMOJIS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function WinnerLineupStrip({
  winners,
  activeRank,
  compact = false,
  allowVoiceChatter = false,
  muted = false,
}: WinnerLineupStripProps) {
  const avatarSize = compact ? 44 : 64;

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
      gap: compact ? 10 : 16, padding: compact ? '12px 0' : '24px 0',
    }}>
      {winners.map(winner => {
        const isActive = activeRank === winner.rank;
        const color = RANK_COLORS[winner.rank] || 'rgba(255,255,255,.5)';
        return (
          <div key={winner.artistId} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            opacity: activeRank !== undefined ? (isActive ? 1 : 0.5) : 1,
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
            transition: 'all .4s ease',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: avatarSize, height: avatarSize, borderRadius: '50%',
                border: `3px solid ${color}`, overflow: 'hidden',
                background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: avatarSize * 0.4, fontWeight: 700, color,
                boxShadow: isActive ? `0 0 20px ${color}66` : 'none',
              }}>
                {winner.artistAvatar
                  ? <img src={winner.artistAvatar} alt={winner.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : winner.artistName[0]}
              </div>
              <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', fontSize: 16, lineHeight: 1 }}>
                {RANK_EMOJIS[winner.rank] || `#${winner.rank}`}
              </div>
            </div>
            <div style={{ fontSize: compact ? 11 : 13, fontWeight: 600, color: '#fff', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {winner.artistName}
            </div>
            {allowVoiceChatter && !muted && (
              <div style={{ display: 'flex', gap: 2, height: 12, alignItems: 'flex-end' }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 2, borderRadius: 1,
                    background: color, opacity: .7,
                    height: `${[8, 12, 6][j]}px`,
                  }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WinnerLineupStrip;

// ═══════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/components/contest/WinnerReactionBurst.tsx
// Action: CREATE | Wave: A9
// Purpose: Animated emoji/reaction burst during group hold phase.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WinnerReactionBurst.tsx
 * Repo: apps/web/src/components/contest/WinnerReactionBurst.tsx
 */
export function WinnerReactionBurst({ active, winnersCount }: { active: boolean; winnersCount: number }) {
  const emojis = ['🎉', '🏆', '🔥', '⭐', '🎊', '🎯', '💫', '🌟'];
  if (!active) return null;

  // Deterministic positions using index - no Math.random() for SSR safety
  const bursts = Array.from({ length: Math.min(winnersCount * 4, 20) }, (_, i) => ({
    emoji: emojis[i % emojis.length],
    left: `${(i * 17 + 5) % 95}%`,
    animDuration: `${1.2 + (i % 8) * 0.15}s`,
    delay: `${(i % 5) * 0.12}s`,
    size: i % 3 === 0 ? 24 : 18,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {bursts.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.left, bottom: '-40px',
          fontSize: b.size, opacity: .8,
          animation: `none`, // CSS animation defined globally
          // Note: wire these to a @keyframes float-up animation in your global CSS
          // @keyframes float-up { from { transform: translateY(0); opacity: .8; } to { transform: translateY(-100vh); opacity: 0; } }
          transform: `translateY(-${(i * 37) % 80}vh)`,
        }}>
          {b.emoji}
        </div>
      ))}
    </div>
  );
}
