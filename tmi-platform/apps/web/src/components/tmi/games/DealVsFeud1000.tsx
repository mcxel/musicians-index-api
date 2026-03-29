/**
 * DealVsFeud1000.tsx
 * Purpose: Deal vs Feud 1000 game show — doors with knock/rattle/open animations, crowd shout window.
 * Placement: apps/web/src/components/live/DealVsFeud1000.tsx
 * Depends on: VotingAntiFraudEngine (fair random), tmi-theme.css
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

export type DoorColor = 'GREEN' | 'RED' | 'BLUE';
export type DoorState = 'CLOSED' | 'KNOCKING' | 'RATTLING' | 'OPENING' | 'OPEN';
export type DoorPrize = 'WIN' | 'LOSE' | 'BONUS' | 'MYSTERY';

export interface GameDoor {
  id: string;
  color: DoorColor;
  state: DoorState;
  prize?: DoorPrize;
  prizeDescription?: string;
  prizeValuePoints?: number;
  revealedTo?: string;   // user ID who chose this door
}

export interface GameShowState {
  phase: 'WAITING' | 'SELECTION' | 'CROWD_SHOUT' | 'REVEALING' | 'RESULTS';
  doors: GameDoor[];
  crowdShoutWindowOpen: boolean;
  crowdSuggestions: string[];
  selectedDoorId?: string;
  winnerUserId?: string;
  winnerName?: string;
  prizeRevealSeed?: string;   // for provably fair randomness
  roundNumber: number;
}

interface DealVsFeud1000Props {
  gameState: GameShowState;
  currentUserId: string;
  currentUserName: string;
  isContestant?: boolean;
  onDoorSelect?: (doorId: string) => void;
  onCrowdShout?: (suggestion: string) => void;
  className?: string;
}

const DOOR_COLORS: Record<DoorColor, { bg: string; border: string; glow: string; emoji: string }> = {
  GREEN: { bg: 'rgba(0,255,168,0.08)', border: '#00FFA8', glow: '0 0 20px rgba(0,255,168,0.3)', emoji: '🟢' },
  RED:   { bg: 'rgba(255,45,170,0.08)', border: '#FF2DAA', glow: '0 0 20px rgba(255,45,170,0.3)', emoji: '🔴' },
  BLUE:  { bg: 'rgba(34,231,255,0.08)', border: '#22E7FF', glow: '0 0 20px rgba(34,231,255,0.3)', emoji: '🔵' },
};

const PRIZE_COLORS: Record<DoorPrize, string> = {
  WIN: '#00FFA8', LOSE: '#FF2DAA', BONUS: '#FFD700', MYSTERY: '#6B39FF',
};

const PRIZE_ICONS: Record<DoorPrize, string> = {
  WIN: '🎉', LOSE: '💀', BONUS: '⭐', MYSTERY: '❓',
};

export const DealVsFeud1000: React.FC<DealVsFeud1000Props> = ({
  gameState,
  currentUserId,
  currentUserName,
  isContestant = false,
  onDoorSelect,
  onCrowdShout,
  className = '',
}) => {
  const [crowdInput, setCrowdInput] = useState('');
  const [shoutCooldown, setShoutCooldown] = useState(false);
  const [hoveredDoor, setHoveredDoor] = useState<string | null>(null);

  const handleShout = useCallback(() => {
    if (!crowdInput.trim() || shoutCooldown) return;
    onCrowdShout?.(crowdInput.trim());
    setCrowdInput('');
    setShoutCooldown(true);
    setTimeout(() => setShoutCooldown(false), 3_000);
  }, [crowdInput, shoutCooldown, onCrowdShout]);

  const handleDoorClick = (door: GameDoor) => {
    if (!isContestant || gameState.phase !== 'SELECTION' || door.state !== 'CLOSED') return;
    onDoorSelect?.(door.id);
  };

  return (
    <>
      <style>{`
        .dvf-root {
          background: linear-gradient(180deg, rgba(11,11,30,0.99) 0%, rgba(8,6,20,1) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          font-family: system-ui, sans-serif;
        }
        .dvf-header {
          padding: 16px 20px;
          background: linear-gradient(90deg, rgba(255,45,170,0.08) 0%, rgba(34,231,255,0.08) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dvf-title {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .dvf-phase-badge {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          animation: ${['REVEALING', 'CROWD_SHOUT'].includes(gameState.phase) ? 'dvf-blink 1s infinite' : 'none'};
        }
        .dvf-doors-area {
          padding: 32px 20px;
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .dvf-door {
          position: relative;
          width: 160px;
          height: 220px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .dvf-door--selectable:hover {
          transform: translateY(-4px);
        }
        .dvf-door--selected {
          animation: dvf-pulse-border 2s infinite;
        }
        .dvf-door--knocking {
          animation: dvf-knock 0.4s ease 3;
        }
        .dvf-door--rattling {
          animation: dvf-rattle 0.1s ease infinite;
        }
        .dvf-door--opening {
          animation: dvf-open 1.2s ease forwards;
        }
        .dvf-door-number {
          font-family: 'Courier New', monospace;
          font-size: 48px;
          font-weight: 700;
          color: rgba(255,255,255,0.15);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          user-select: none;
        }
        .dvf-door-icon {
          font-size: 48px;
          position: relative;
          z-index: 1;
        }
        .dvf-door-prize-label {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 8px;
          position: relative;
          z-index: 1;
          animation: dvf-fade-in 0.5s ease;
        }
        .dvf-door-value {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          font-weight: 700;
          position: relative;
          z-index: 1;
          margin-top: 4px;
        }
        .dvf-winner-crown {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 28px;
          animation: dvf-bounce 0.5s ease infinite alternate;
        }
        .dvf-crowd-section {
          padding: 16px 20px;
          background: rgba(107,57,255,0.05);
          border-top: 1px solid rgba(107,57,255,0.2);
        }
        .dvf-crowd-label {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #6B39FF;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dvf-crowd-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6B39FF;
          animation: dvf-dot-pulse 1s infinite;
        }
        .dvf-suggestions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          min-height: 28px;
        }
        .dvf-suggestion-chip {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(107,57,255,0.15);
          border: 1px solid rgba(107,57,255,0.3);
          color: rgba(255,255,255,0.7);
          animation: dvf-pop-in 0.3s ease;
        }
        .dvf-crowd-input-row {
          display: flex;
          gap: 8px;
        }
        .dvf-crowd-input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(107,57,255,0.3);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #FFFFFF;
          outline: none;
          transition: border-color 0.2s;
        }
        .dvf-crowd-input:focus { border-color: #6B39FF; }
        .dvf-crowd-btn {
          padding: 8px 14px;
          background: rgba(107,57,255,0.25);
          border: 1px solid rgba(107,57,255,0.5);
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          color: #6B39FF;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          text-transform: uppercase;
        }
        .dvf-crowd-btn:hover:not(:disabled) { background: rgba(107,57,255,0.4); }
        .dvf-crowd-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .dvf-results {
          padding: 24px;
          text-align: center;
        }
        .dvf-winner-text {
          font-family: 'Courier New', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 2px;
          animation: dvf-pop-in 0.5s ease;
        }
        .dvf-round-badge {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
        }
        @keyframes dvf-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes dvf-knock {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes dvf-rattle {
          0% { transform: rotate(-1deg) translateX(-2px); }
          100% { transform: rotate(1deg) translateX(2px); }
        }
        @keyframes dvf-open {
          0% { transform: perspective(400px) rotateY(0deg) scaleX(1); }
          60% { transform: perspective(400px) rotateY(-75deg) scaleX(0.1); }
          100% { transform: perspective(400px) rotateY(-90deg) scaleX(0); }
        }
        @keyframes dvf-pulse-border { 0%,100% { box-shadow: 0 0 0 2px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 0 4px rgba(255,215,0,0.7); } }
        @keyframes dvf-bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-8px) rotate(10deg); } }
        @keyframes dvf-pop-in { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes dvf-dot-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
        @keyframes dvf-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className={`dvf-root ${className}`}>
        {/* Header */}
        <div className="dvf-header">
          <div>
            <div className="dvf-title">Deal vs Feud 1000</div>
            <div className="dvf-round-badge">Round {gameState.roundNumber}</div>
          </div>
          <div
            className="dvf-phase-badge"
            style={{
              background: PHASE_COLORS[gameState.phase].bg,
              color: PHASE_COLORS[gameState.phase].text,
              border: `1px solid ${PHASE_COLORS[gameState.phase].text}44`,
            }}
          >
            {PHASE_LABELS[gameState.phase]}
          </div>
        </div>

        {/* Doors */}
        <div className="dvf-doors-area">
          {gameState.doors.map((door, idx) => {
            const config = DOOR_COLORS[door.color];
            const isSelected = door.id === gameState.selectedDoorId;
            const isOpen = door.state === 'OPEN';
            const selectable = isContestant && gameState.phase === 'SELECTION' && door.state === 'CLOSED';

            return (
              <div
                key={door.id}
                className={`dvf-door dvf-door--${door.state.toLowerCase()} ${selectable ? 'dvf-door--selectable' : ''} ${isSelected ? 'dvf-door--selected' : ''}`}
                style={{
                  background: config.bg,
                  border: `2px solid ${isSelected ? '#FFD700' : config.border}`,
                  boxShadow: isOpen ? `${config.glow}, inset 0 0 40px rgba(0,0,0,0.5)` : 'none',
                  cursor: selectable ? 'pointer' : 'default',
                }}
                onClick={() => handleDoorClick(door)}
                onMouseEnter={() => setHoveredDoor(door.id)}
                onMouseLeave={() => setHoveredDoor(null)}
              >
                {isOpen && door.prize ? (
                  <>
                    <div className="dvf-door-icon">{PRIZE_ICONS[door.prize]}</div>
                    <div className="dvf-door-prize-label" style={{ color: PRIZE_COLORS[door.prize] }}>
                      {door.prize}
                    </div>
                    {door.prizeValuePoints && (
                      <div className="dvf-door-value" style={{ color: PRIZE_COLORS[door.prize] }}>
                        {door.prizeValuePoints.toLocaleString()} pts
                      </div>
                    )}
                    {door.prizeDescription && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center', padding: '0 12px' }}>
                        {door.prizeDescription}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="dvf-door-number">{idx + 1}</div>
                    <div style={{ fontSize: 36 }}>{config.emoji}</div>
                    {selectable && hoveredDoor === door.id && (
                      <div style={{ position: 'absolute', bottom: 12, fontFamily: 'Courier New, monospace', fontSize: 10, color: config.border, letterSpacing: 1 }}>
                        TAP TO CHOOSE
                      </div>
                    )}
                  </>
                )}

                {isSelected && gameState.phase !== 'RESULTS' && (
                  <div className="dvf-winner-crown">👑</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Crowd Shout Window */}
        {(gameState.crowdShoutWindowOpen || gameState.phase === 'CROWD_SHOUT') && (
          <div className="dvf-crowd-section">
            <div className="dvf-crowd-label">
              <div className="dvf-crowd-pulse" />
              Crowd Shout Window ({8}–{15}s) — Yell Your Pick!
            </div>
            <div className="dvf-suggestions">
              {gameState.crowdSuggestions.slice(-8).map((s, i) => (
                <div key={i} className="dvf-suggestion-chip">{s}</div>
              ))}
            </div>
            <div className="dvf-crowd-input-row">
              <input
                className="dvf-crowd-input"
                placeholder="Shout your suggestion..."
                value={crowdInput}
                onChange={e => setCrowdInput(e.target.value.slice(0, 40))}
                onKeyDown={e => e.key === 'Enter' && handleShout()}
                maxLength={40}
              />
              <button className="dvf-crowd-btn" onClick={handleShout} disabled={shoutCooldown || !crowdInput.trim()}>
                {shoutCooldown ? 'COOLDOWN' : '📣 SHOUT'}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {gameState.phase === 'RESULTS' && gameState.winnerName && (
          <div className="dvf-results">
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎊</div>
            <div className="dvf-winner-text">
              {gameState.winnerUserId === currentUserId ? 'YOU WIN!' : `${gameState.winnerName} WINS!`}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const PHASE_LABELS: Record<GameShowState['phase'], string> = {
  WAITING: '⏸ Waiting',
  SELECTION: '👉 Choose a Door',
  CROWD_SHOUT: '📣 Crowd Shout!',
  REVEALING: '🎲 Revealing...',
  RESULTS: '🏆 Results',
};

const PHASE_COLORS: Record<GameShowState['phase'], { bg: string; text: string }> = {
  WAITING:   { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)' },
  SELECTION: { bg: 'rgba(255,215,0,0.1)', text: '#FFD700' },
  CROWD_SHOUT: { bg: 'rgba(107,57,255,0.1)', text: '#6B39FF' },
  REVEALING: { bg: 'rgba(255,45,170,0.1)', text: '#FF2DAA' },
  RESULTS:   { bg: 'rgba(0,255,168,0.1)', text: '#00FFA8' },
};

export default DealVsFeud1000;
