"use client";

import type { BeboStage } from '@/lib/shows/BeboHookEngine';
import { CrowdVoteBar } from './CrowdVoteBar';

interface BeboStageState {
  stage: BeboStage;
  sustainedBooTicks: number;
  peekThreshold: number;
  warningThreshold: number;
  removalThreshold: number;
  recoveryThreshold: number;
  minSustainedTicks: number;
}

interface BeboHookPanelProps {
  beboState: BeboStageState;
  onHook: (id: string) => void;
  onReturn: (id: string) => void;
  activeContestantId?: string;
  recentBooCount?: number;
  recentYayCount?: number;
}

const STAGE_COLOR: Record<BeboStage, string> = {
  OFFSTAGE:          '#00FF88',
  PEEK:              '#FFD700',
  ON_STAGE_WARNING:  '#FF9900',
  RECOVERY_EXIT:     '#00FF88',
  REMOVAL:           '#FF4444',
};

const STAGE_LABEL: Record<BeboStage, string> = {
  OFFSTAGE:          'OFFSTAGE',
  PEEK:              'PEEKING FROM BACKSTAGE',
  ON_STAGE_WARNING:  'ON STAGE — WARNING',
  RECOVERY_EXIT:     'EXITING — CROWD RECOVERED',
  REMOVAL:           'REMOVAL',
};

export function BeboHookPanel({ beboState, onHook, onReturn, activeContestantId, recentBooCount = 0, recentYayCount = 0 }: BeboHookPanelProps) {
  const targetId = activeContestantId ?? '';
  const stageColor = STAGE_COLOR[beboState.stage];
  const isWarned = beboState.stage === 'ON_STAGE_WARNING';
  const isRemoved = beboState.stage === 'REMOVAL';
  const canReturn = beboState.stage === 'REMOVAL';
  const sustainedProgress = Math.min(beboState.sustainedBooTicks / (beboState.minSustainedTicks || 1), 1);

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
            PEEK: {Math.round(beboState.peekThreshold * 100)}% &nbsp;|&nbsp;
            WARN: {Math.round(beboState.warningThreshold * 100)}% &nbsp;|&nbsp;
            REMOVE: {Math.round(beboState.removalThreshold * 100)}% &nbsp;|&nbsp;
            RECOVER: {Math.round(beboState.recoveryThreshold * 100)}%
          </div>
        </div>
      </div>

      {/* Current stage status */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          marginBottom: 14,
          background: isRemoved ? 'rgba(255,68,68,0.1)' : isWarned ? 'rgba(255,153,0,0.1)' : 'rgba(0,255,136,0.08)',
          border: `1px solid ${stageColor}55`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>{isRemoved ? '❌' : isWarned ? '⚠️' : '🟢'}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: stageColor, letterSpacing: '0.15em' }}>
            {STAGE_LABEL[beboState.stage]}
          </div>
          {targetId && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              PERFORMER: {targetId}
            </div>
          )}
        </div>
      </div>

      {/* Sustained boo progress bar */}
      {isWarned && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
            BOO SUSTAINED ({beboState.sustainedBooTicks} / {beboState.minSustainedTicks} ticks to removal)
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${sustainedProgress * 100}%`,
                background: sustainedProgress >= 1 ? '#FF4444' : '#FF9900',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Manual override buttons */}
      {targetId && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => onHook(targetId)}
            disabled={isRemoved}
            style={{
              flex: 1,
              padding: '12px 0',
              background: !isRemoved ? 'rgba(255,68,68,0.15)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${!isRemoved ? '#FF444455' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10,
              color: !isRemoved ? '#FF4444' : 'rgba(255,255,255,0.25)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.2em',
              cursor: !isRemoved ? 'pointer' : 'not-allowed',
            }}
          >
            🎣 HOOK
          </button>
          <button
            onClick={() => onReturn(targetId)}
            disabled={!canReturn}
            style={{
              flex: 1,
              padding: '12px 0',
              background: canReturn ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${canReturn ? '#00FF8855' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10,
              color: canReturn ? '#00FF88' : 'rgba(255,255,255,0.25)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.2em',
              cursor: canReturn ? 'pointer' : 'not-allowed',
            }}
          >
            ↩ RETURN
          </button>
        </div>
      )}

      {/* Crowd vote summary bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
          RECENT CROWD SIGNAL
        </div>
        <CrowdVoteBar
          yayCount={recentYayCount}
          booCount={recentBooCount}
          open={false}
          onVote={() => undefined}
        />
      </div>

    </div>
  );
}
