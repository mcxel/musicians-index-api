"use client";

import type { MondayNightStageState } from '@/lib/shows/MondayNightStageEngine';
import { BeboHookPanel } from './BeboHookPanel';
import { CrowdVoteBar } from './CrowdVoteBar';

interface MondayNightStagePanelProps {
  stageState: MondayNightStageState;
  onPresentContestant: (id: string) => void;
  onProcessVote: () => void;
  onCrowdVote?: (type: 'yay' | 'boo') => void;
  onHook?: (id: string) => void;
  onReturn?: (id: string) => void;
}

const KIRA_POSITION_COLORS: Record<string, string> = {
  'stage-left': '#00FFFF',
  'stage-right': '#00FFFF',
  'center-stage': '#FF2DAA',
  'audience-walk': '#00FF88',
  'contestant-spot': '#FFD700',
  'judge-area': '#c4b5fd',
  entrance: 'rgba(255,255,255,0.4)',
};

export function MondayNightStagePanel({
  stageState,
  onPresentContestant,
  onProcessVote,
  onCrowdVote,
  onHook,
  onReturn,
}: MondayNightStagePanelProps) {
  const { show, bebo, kira, panelVisible, panelContestantId } = stageState;
  const activeContestants = show.contestants.filter((c) => c.active && !c.eliminated);
  const kiraColor = KIRA_POSITION_COLORS[kira.currentPosition] ?? '#00FFFF';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top row: Bebo (left) + Kira (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Bebo panel */}
        <BeboHookPanel
          beboState={bebo}
          onHook={onHook ?? (() => undefined)}
          onReturn={onReturn ?? (() => undefined)}
          activeContestantId={panelContestantId ?? undefined}
        />

        {/* Kira position */}
        <div
          style={{
            background: 'rgba(3,2,11,0.95)',
            border: '1px solid rgba(0,255,255,0.2)',
            borderRadius: 14,
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#00FFFF', marginBottom: 14 }}>
            KIRA — WALKAROUND
          </div>

          {/* Current position badge */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: `${kiraColor}11`,
              border: `1px solid ${kiraColor}44`,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>POSITION</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: kiraColor, letterSpacing: '0.1em' }}>
              {kira.currentPosition.toUpperCase().replace(/-/g, ' ')}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
              {kira.currentAction.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Walk history */}
          {kira.moveHistory.length > 0 && (
            <div>
              <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
                RECENT MOVES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {kira.moveHistory
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((m, i) => (
                    <div
                      key={`${m.from}-${m.to}-${m.timestamp}-${i}`}
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.4)',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 4,
                        padding: '3px 7px',
                      }}
                    >
                      {m.from} → {m.to}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contestant panel (center) */}
      {panelVisible && panelContestantId && (
        <div
          style={{
            background: 'rgba(255,215,0,0.07)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>ON STAGE</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FFD700' }}>{panelContestantId}</div>
          </div>
          <button
            type="button"
            onClick={onProcessVote}
            style={{
              padding: '8px 18px',
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid #FFD700',
              borderRadius: 8,
              color: '#FFD700',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            PROCESS VOTE
          </button>
        </div>
      )}

      {/* Crowd vote bar */}
      <div style={{ background: 'rgba(3,2,11,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
          CROWD VOTE
        </div>
        <CrowdVoteBar
          yayCount={show.crowdYayCount}
          booCount={show.crowdBooCount}
          open={show.crowdVoteOpen}
          onVote={onCrowdVote ?? (() => undefined)}
        />
      </div>

      {/* Active contestant list */}
      {activeContestants.length > 0 && (
        <div style={{ background: 'rgba(3,2,11,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            CONTESTANTS — CLICK TO PRESENT
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {activeContestants.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPresentContestant(c.id)}
                style={{
                  padding: '7px 14px',
                  background: panelContestantId === c.id ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${panelContestantId === c.id ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 7,
                  color: panelContestantId === c.id ? '#FFD700' : '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {c.name} — {c.score}pts
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
