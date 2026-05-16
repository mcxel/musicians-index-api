"use client";

import type { BeboPanelState } from '@/lib/shows/BeboHookEngine';
import { CrowdVoteBar } from './CrowdVoteBar';

interface BeboHookPanelProps {
  beboState: BeboPanelState;
  onHook: (id: string) => void;
  onReturn: (id: string) => void;
  activeContestantId?: string;
}

export function BeboHookPanel({ beboState, onHook, onReturn, activeContestantId }: BeboHookPanelProps) {
  const targetId = activeContestantId ?? beboState.contestantId ?? '';
  const isHooked = beboState.action === 'HOOK';
  const totalVotes = beboState.hookHistory.length;

  // Derive yay/boo from hook history for display (last 10 events)
  const recentBooCount = beboState.hookHistory
    .slice(-10)
    .filter((h) => h.action === 'HOOK').length;
  const recentYayCount = beboState.hookHistory
    .slice(-10)
    .filter((h) => h.action === 'RETURN').length;

  return (
    <div
      style={{
        background: 'rgba(3,2,11,0.95)',
        border: '1px solid rgba(255,153,0,0.3)',
        borderRadius: 14,
        padding: '18px 20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🎣</span>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#FF9900' }}>BEBO HOOK PANEL</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
            BOO THRESHOLD: {Math.round(beboState.crowdBooThreshold * 100)}% &nbsp;|&nbsp; YAY THRESHOLD: {Math.round(beboState.crowdYayThreshold * 100)}%
          </div>
        </div>
        {beboState.autoHookEnabled && (
          <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, color: '#FF9900', border: '1px solid #FF990055', borderRadius: 4, padding: '2px 8px' }}>
            AUTO-HOOK ON
          </span>
        )}
      </div>

      {/* Current action status */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          marginBottom: 14,
          background: isHooked ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,136,0.08)',
          border: `1px solid ${isHooked ? '#FF444455' : '#00FF8855'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: isHooked ? '#FF4444' : '#00FF88', letterSpacing: '0.1em' }}>
          {beboState.action}
        </span>
        {beboState.contestantId && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
            ID: {beboState.contestantId}
          </span>
        )}
      </div>

      {/* Hook / Return buttons */}
      {targetId && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => onHook(targetId)}
            disabled={!targetId}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'rgba(255,68,68,0.15)',
              border: '2px solid #FF4444',
              borderRadius: 10,
              color: '#FF4444',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.2em',
              cursor: targetId ? 'pointer' : 'not-allowed',
            }}
          >
            🎣 HOOK
          </button>
          <button
            type="button"
            onClick={() => onReturn(targetId)}
            disabled={!isHooked}
            style={{
              flex: 1,
              padding: '12px 0',
              background: isHooked ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${isHooked ? '#00FF88' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10,
              color: isHooked ? '#00FF88' : 'rgba(255,255,255,0.25)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.2em',
              cursor: isHooked ? 'pointer' : 'not-allowed',
            }}
          >
            ↩ RETURN
          </button>
        </div>
      )}

      {/* Crowd vote summary bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
          RECENT CROWD SIGNAL (last 10 events)
        </div>
        <CrowdVoteBar
          yayCount={recentYayCount}
          booCount={recentBooCount}
          open={false}
          onVote={() => undefined}
        />
      </div>

      {/* Hook history */}
      {beboState.hookHistory.length > 0 && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
            HOOK HISTORY ({beboState.hookHistory.length})
          </div>
          <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {beboState.hookHistory
              .slice()
              .reverse()
              .slice(0, 8)
              .map((h, i) => (
                <div
                  key={`${h.contestantId}-${h.timestamp}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 5,
                    padding: '4px 8px',
                    fontSize: 9,
                  }}
                >
                  <span
                    style={{
                      color: h.action === 'HOOK' ? '#FF4444' : h.action === 'RETURN' ? '#00FF88' : '#FFD700',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {h.action}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{h.contestantId}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                    BOO: {Math.round(h.crowdBooAtHook * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {totalVotes === 0 && (
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '8px 0', letterSpacing: '0.1em' }}>
          NO HOOK EVENTS YET
        </div>
      )}
    </div>
  );
}
