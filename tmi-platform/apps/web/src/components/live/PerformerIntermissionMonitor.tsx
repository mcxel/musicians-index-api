'use client';

import React from 'react';
import { IntermissionState } from '@/lib/live/IntermissionDirectorEngine';

/**
 * D1-D: Performer Monitor — Intermission Status Display
 *
 * Shows performer:
 * - Live intermission activity
 * - Audience engagement metrics
 * - Current sponsor
 * - Time remaining
 * - RESUME SHOW button (Rule 2 hard lock — performer always in control)
 */

interface PerformerIntermissionMonitorProps {
  state: IntermissionState;
  performerName: string;
  accentColor?: string;
  onResume: () => void;
}

export default function PerformerIntermissionMonitor({
  state,
  performerName,
  accentColor = '#FF2DAA',
  onResume,
}: PerformerIntermissionMonitorProps) {
  const formatTime = (ms: number) => {
    const secs = Math.ceil(ms / 1000);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const energyLabel = (level: number) => {
    if (level >= 80) return 'FRENZY';
    if (level >= 60) return 'ELECTRIC';
    if (level >= 40) return 'BUILDING';
    if (level >= 20) return 'WARMING';
    return 'CALM';
  };

  const energyColor = (level: number) => {
    if (level >= 80) return '#FF2DAA';
    if (level >= 60) return '#FFD700';
    if (level >= 40) return '#00FFFF';
    if (level >= 20) return '#00FF88';
    return 'rgba(255,255,255,0.3)';
  };

  return (
    <div
      style={{
        border: `2px solid ${accentColor}`,
        borderRadius: 16,
        background: `linear-gradient(135deg, rgba(5,5,16,0.95), rgba(0,0,0,0.8))`,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 320,
        maxWidth: 420,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FFD700',
              boxShadow: '0 0 12px #FFD700',
              animation: 'pmPulse 1.5s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: '#FFD700',
              textTransform: 'uppercase',
            }}
          >
            INTERMISSION ACTIVE
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {state.phase}
        </span>
      </div>

      {/* Sponsor info */}
      {state.activeSponsor && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: `${state.activeSponsor.accentColor}15`,
            border: `1px solid ${state.activeSponsor.accentColor}44`,
          }}
        >
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 4 }}>
            FEATURING
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: state.activeSponsor.accentColor }}>
            {state.activeSponsor.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            {state.activeSponsor.cta}
          </div>
        </div>
      )}

      {/* Time remaining */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>TIME REMAINING</span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: state.remainingMs > 10000 ? '#00FF88' : state.remainingMs > 5000 ? '#FFD700' : '#FF2DAA',
            fontFamily: 'monospace',
          }}
        >
          {formatTime(state.remainingMs)}
        </span>
      </div>

      {/* Audience metrics grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {/* Energy */}
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${energyColor(state.audienceEnergyLevel)}44`,
          }}
        >
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 4 }}>
            ENERGY
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: energyColor(state.audienceEnergyLevel) }}>
            {state.audienceEnergyLevel}%
          </div>
          <div style={{ fontSize: 7, color: energyColor(state.audienceEnergyLevel), marginTop: 2 }}>
            {energyLabel(state.audienceEnergyLevel)}
          </div>
        </div>

        {/* XP earned */}
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.44)',
          }}
        >
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 4 }}>
            AUDIENCE XP
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#00FF88' }}>
            +{state.audienceXpEarned}
          </div>
          <div style={{ fontSize: 7, color: '#00FF88', marginTop: 2 }}>earned</div>
        </div>

        {/* Poll votes */}
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: 'rgba(0,255,255,0.08)',
            border: '1px solid rgba(0,255,255,0.44)',
          }}
        >
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 4 }}>
            POLL VOTES
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#00FFFF' }}>
            {state.pollVotes}
          </div>
          <div style={{ fontSize: 7, color: '#00FFFF', marginTop: 2 }}>voted</div>
        </div>

        {/* Trivia players */}
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: 'rgba(170,45,255,0.08)',
            border: '1px solid rgba(170,45,255,0.44)',
          }}
        >
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 4 }}>
            TRIVIA
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#AA2DFF' }}>
            {state.trivaPlaying}
          </div>
          <div style={{ fontSize: 7, color: '#AA2DFF', marginTop: 2 }}>playing</div>
        </div>
      </div>

      {/* Rule 2 hard lock — Resume button */}
      <button
        onClick={onResume}
        style={{
          padding: '14px 16px',
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`,
          border: 'none',
          borderRadius: 10,
          color: '#050510',
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: `0 0 20px ${accentColor}66`,
          transition: 'all 0.2s ease',
          width: '100%',
          marginTop: 4,
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.boxShadow = `0 0 30px ${accentColor}99`;
          target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.boxShadow = `0 0 20px ${accentColor}66`;
          target.style.transform = 'translateY(0)';
        }}
      >
        {state.performerCanResume ? '▶ RESUME SHOW NOW' : 'RESUMING…'}
      </button>

      {/* Rule 2 info */}
      <div
        style={{
          padding: 8,
          borderRadius: 8,
          background: 'rgba(255,45,170,0.05)',
          border: '1px solid rgba(255,45,170,0.2)',
          fontSize: 8,
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          lineHeight: '1.3',
        }}
      >
        You control the show. Click RESUME anytime — nothing can block your audience's return.
      </div>

      <style>{`
        @keyframes pmPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
