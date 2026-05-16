"use client";

interface CrowdVoteBarProps {
  yayCount: number;
  booCount: number;
  open: boolean;
  onVote: (type: 'yay' | 'boo') => void;
}

export function CrowdVoteBar({ yayCount, booCount, open, onVote }: CrowdVoteBarProps) {
  const total = yayCount + booCount;
  const yayPct = total > 0 ? Math.round((yayCount / total) * 100) : 50;
  const booPct = 100 - yayPct;

  return (
    <div style={{ width: '100%' }}>
      {/* Vote bar */}
      <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 10 }}>
        <div
          style={{
            width: `${yayPct}%`,
            background: 'linear-gradient(90deg, #00FFFF44, #00FFFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 800,
            color: '#03020b',
            letterSpacing: '0.1em',
            transition: 'width 0.4s ease',
          }}
        >
          {yayPct > 15 ? `YAY ${yayPct}%` : ''}
        </div>
        <div
          style={{
            width: `${booPct}%`,
            background: 'linear-gradient(90deg, #FF444488, #FF4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.1em',
            transition: 'width 0.4s ease',
          }}
        >
          {booPct > 15 ? `BOO ${booPct}%` : ''}
        </div>
      </div>

      {/* Vote counts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: '#00FFFF', fontWeight: 700 }}>{yayCount} YAY</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{total} TOTAL VOTES</span>
        <span style={{ fontSize: 10, color: '#FF4444', fontWeight: 700 }}>{booCount} BOO</span>
      </div>

      {/* Vote buttons — only shown when vote is open */}
      {open && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => onVote('yay')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'rgba(0,255,255,0.12)',
              border: '1px solid #00FFFF',
              borderRadius: 8,
              color: '#00FFFF',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '0.2em',
              cursor: 'pointer',
            }}
          >
            YAY
          </button>
          <button
            type="button"
            onClick={() => onVote('boo')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'rgba(255,68,68,0.12)',
              border: '1px solid #FF4444',
              borderRadius: 8,
              color: '#FF4444',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '0.2em',
              cursor: 'pointer',
            }}
          >
            BOO
          </button>
        </div>
      )}

      {!open && (
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', padding: '6px 0' }}>
          VOTE CLOSED
        </div>
      )}
    </div>
  );
}
