/**
 * HostStageCard.tsx
 * Repo: apps/web/src/components/host/HostStageCard.tsx
 * Action: CREATE | Wave: W2
 */
'use client';

interface HostStageCardProps {
  hostName?: string;
  isLive?: boolean;
  seasonName?: string;
  episodeLabel?: string;
  onGoLive?: () => void;
  onEndShow?: () => void;
  onPause?: () => void;
}

export function HostStageCard({
  hostName = 'Ray Journey',
  isLive = false,
  seasonName = 'Season 1',
  episodeLabel,
  onGoLive,
  onEndShow,
  onPause,
}: HostStageCardProps) {
  return (
    <div style={{
      background: '#0a0d14',
      border: `2px solid ${isLive ? 'rgba(255,48,48,.4)' : 'rgba(255,255,255,.1)'}`,
      borderRadius: 12, padding: 18,
      boxShadow: isLive ? '0 0 24px rgba(255,48,48,.1)' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{hostName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
            {seasonName}{episodeLabel ? ` · ${episodeLabel}` : ''}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: isLive ? 'rgba(255,48,48,.1)' : 'rgba(255,255,255,.05)',
          border: `1px solid ${isLive ? 'rgba(255,48,48,.3)' : 'rgba(255,255,255,.1)'}`,
        }}>
          {isLive && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3030' }} />
          )}
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: isLive ? '#ff5252' : 'rgba(255,255,255,.4)',
          }}>
            {isLive ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Controls */}
      {!isLive ? (
        <button
          onClick={onGoLive}
          style={{
            width: '100%', padding: '12px', border: 'none', borderRadius: 8,
            background: 'linear-gradient(135deg,#ff3030,#ff5252)',
            color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            letterSpacing: '.05em',
          }}
        >
          🎙 Go Live
        </button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={onPause}
            style={{
              padding: '10px', background: 'rgba(255,215,0,.1)',
              border: '1px solid rgba(255,215,0,.3)', borderRadius: 8,
              color: '#ffd700', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            ⏸ Pause
          </button>
          <button
            onClick={onEndShow}
            style={{
              padding: '10px', background: 'rgba(255,48,48,.1)',
              border: '1px solid rgba(255,48,48,.3)', borderRadius: 8,
              color: '#ff5252', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            ⏹ End Show
          </button>
        </div>
      )}
    </div>
  );
}

export default HostStageCard;
