"use client";

import type { ShowPhase, Contestant, ShowResult } from '@/lib/shows/ShowRuntimeEngine';
import { CrowdVoteBar } from './CrowdVoteBar';

interface ShowRuntimeHUDProps {
  showId: string;
  phase: ShowPhase;
  contestants: Contestant[];
  round: number;
  maxRounds: number;
  crowdYay: number;
  crowdBoo: number;
  crowdVoteOpen: boolean;
  winner: ShowResult | null;
  onCrowdVote: (type: 'yay' | 'boo') => void;
}

const PHASE_COLOR: Record<ShowPhase, string> = {
  WARMUP: '#00FFFF',
  ROUND_1: '#FFD700',
  ROUND_2: '#FFD700',
  ROUND_3: '#FF9900',
  FINALS: '#FF2DAA',
  ELIMINATION: '#FF4444',
  WINNER_REVEAL: '#FFD700',
  POST_SHOW: 'rgba(255,255,255,0.4)',
};

export function ShowRuntimeHUD({
  showId,
  phase,
  contestants,
  round,
  maxRounds,
  crowdYay,
  crowdBoo,
  crowdVoteOpen,
  winner,
  onCrowdVote,
}: ShowRuntimeHUDProps) {
  const phaseColor = PHASE_COLOR[phase] ?? '#fff';
  const active = contestants.filter((c) => c.active && !c.eliminated);
  const eliminated = contestants.filter((c) => c.eliminated);

  return (
    <div
      style={{
        background: 'rgba(3,2,11,0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '20px 22px',
        fontFamily: 'inherit',
      }}
    >
      {/* Phase + Round header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: phaseColor,
              border: `1px solid ${phaseColor}55`,
              borderRadius: 5,
              padding: '3px 10px',
            }}
          >
            {phase.replace('_', ' ')}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            {showId.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 800 }}>
          ROUND {round} / {maxRounds}
        </div>
      </div>

      {/* Winner banner */}
      {winner && (
        <div
          style={{
            background: 'rgba(255,215,0,0.12)',
            border: '1px solid #FFD700',
            borderRadius: 10,
            padding: '14px 18px',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', marginBottom: 4 }}>WINNER</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#FFD700' }}>{winner.winnerName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Score: {winner.score.toLocaleString()} pts
          </div>
        </div>
      )}

      {/* Active contestants */}
      {active.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
            ACTIVE CONTESTANTS ({active.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {active
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: i === 0 ? 'rgba(255,215,0,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 7,
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.4)', fontWeight: 700, minWidth: 16 }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: i === 0 ? '#FFD700' : '#00FFFF' }}>
                    {c.score.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,68,68,0.5)', marginBottom: 6 }}>
            ELIMINATED ({eliminated.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {eliminated.map((c) => (
              <span
                key={c.id}
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'line-through',
                  background: 'rgba(255,68,68,0.05)',
                  border: '1px solid rgba(255,68,68,0.2)',
                  borderRadius: 4,
                  padding: '2px 8px',
                }}
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Crowd vote */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
          CROWD VOTE
        </div>
        <CrowdVoteBar
          yayCount={crowdYay}
          booCount={crowdBoo}
          open={crowdVoteOpen}
          onVote={onCrowdVote}
        />
      </div>
    </div>
  );
}
