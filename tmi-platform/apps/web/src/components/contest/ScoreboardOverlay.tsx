/**
 * ScoreboardOverlay.tsx
 * Repo: apps/web/src/components/contest/ScoreboardOverlay.tsx
 * Action: CREATE | Wave: W2
 */
'use client';

interface ScoreEntry {
  rank: number;
  artistName: string;
  score: number;
  change?: 'up' | 'down' | 'same';
  artistAvatar?: string;
}

interface ScoreboardOverlayProps {
  entries?: ScoreEntry[];
  title?: string;
  compact?: boolean;
  maxVisible?: number;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const CHANGE_COLOR = { up: '#00c853', down: '#ff5252', same: 'rgba(255,255,255,.3)' };
const CHANGE_SYMBOL = { up: '▲', down: '▼', same: '–' };

export function ScoreboardOverlay({
  entries = [],
  title = 'Leaderboard',
  compact = false,
  maxVisible,
}: ScoreboardOverlayProps) {
  const displayed = maxVisible ? entries.slice(0, maxVisible) : compact ? entries.slice(0, 5) : entries;

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: compact ? 10 : 12,
      padding: compact ? '12px 14px' : 20,
    }}>
      {!compact && (
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>{title}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10 }}>
        {displayed.map(entry => {
          const isTopThree = entry.rank <= 3;
          return (
            <div
              key={entry.rank}
              style={{
                display: 'flex', alignItems: 'center', gap: compact ? 8 : 10,
                padding: compact ? '6px 8px' : '8px 12px',
                background: isTopThree
                  ? `rgba(255,215,0,0.0${5 - entry.rank})`
                  : 'rgba(255,255,255,.02)',
                borderRadius: 8,
                border: isTopThree ? '1px solid rgba(255,215,0,.1)' : '1px solid transparent',
              }}
            >
              {/* Rank / medal */}
              <span style={{ fontSize: compact ? 14 : 18, minWidth: 28, textAlign: 'center' }}>
                {MEDALS[entry.rank] ?? `#${entry.rank}`}
              </span>

              {/* Avatar */}
              {!compact && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,107,26,.1)', border: '1px solid rgba(255,107,26,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#ff6b1a', overflow: 'hidden', flexShrink: 0,
                }}>
                  {entry.artistAvatar
                    ? <img src={entry.artistAvatar} alt={entry.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : entry.artistName[0]}
                </div>
              )}

              {/* Name */}
              <span style={{
                flex: 1, fontSize: compact ? 12 : 14,
                fontWeight: isTopThree ? 700 : 600, color: '#fff',
              }}>
                {entry.artistName}
              </span>

              {/* Change indicator */}
              {entry.change && (
                <span style={{ fontSize: 10, color: CHANGE_COLOR[entry.change], fontWeight: 700 }}>
                  {CHANGE_SYMBOL[entry.change]}
                </span>
              )}

              {/* Score */}
              <span style={{
                fontSize: compact ? 12 : 14, fontWeight: 700,
                color: isTopThree ? '#ffd700' : 'rgba(255,255,255,.7)',
              }}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13, padding: '16px 0' }}>
            Scoreboard empty. Competing phase not yet started.
          </p>
        )}
      </div>
    </div>
  );
}

export default ScoreboardOverlay;
