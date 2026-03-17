/**
 * PrizeRevealControlPanel.tsx
 * Repo: apps/web/src/components/host/PrizeRevealControlPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';
import { Trophy } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  placement: number;
  cashValue?: number;
  prizeType?: string;
}

interface PrizeRevealControlPanelProps {
  prizes?: Prize[];
  onReveal?: (prizeId: string, winnerName: string) => void;
}

export function PrizeRevealControlPanel({ prizes = [], onReveal }: PrizeRevealControlPanelProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const handleReveal = (prizeId: string) => {
    const winner = inputs[prizeId]?.trim();
    if (!winner) return;
    onReveal?.(prizeId, winner);
    setRevealed(prev => new Set([...prev, prizeId]));
  };

  const sorted = [...prizes].sort((a, b) => b.placement - a.placement);

  return (
    <div style={{
      background: '#0a0d14',
      border: '1px solid rgba(255,215,0,.2)',
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Trophy size={16} color="#ffd700" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>Prize Reveal Controls</span>
      </div>

      {sorted.length === 0 ? (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
          No prizes configured for this season.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(prize => {
            const isRevealed = revealed.has(prize.id);
            return (
              <div
                key={prize.id}
                style={{
                  padding: '12px 14px',
                  background: isRevealed ? 'rgba(255,215,0,.05)' : 'rgba(255,255,255,.03)',
                  border: `1px solid ${isRevealed ? 'rgba(255,215,0,.2)' : 'rgba(255,255,255,.06)'}`,
                  borderRadius: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    #{prize.placement} — {prize.name}
                  </span>
                  {prize.cashValue && (
                    <span style={{ fontSize: 12, color: '#ffd700', fontWeight: 700 }}>
                      ${prize.cashValue.toLocaleString()}
                    </span>
                  )}
                </div>

                {isRevealed ? (
                  <div style={{ fontSize: 13, color: '#ffd700', fontWeight: 700 }}>
                    ✓ Winner: {inputs[prize.id]}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={inputs[prize.id] ?? ''}
                      onChange={e => setInputs(prev => ({ ...prev, [prize.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleReveal(prize.id)}
                      placeholder="Enter winner name…"
                      style={{
                        flex: 1, padding: '7px 10px',
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.1)',
                        borderRadius: 6, color: '#fff', fontSize: 12,
                      }}
                    />
                    <button
                      onClick={() => handleReveal(prize.id)}
                      disabled={!inputs[prize.id]?.trim()}
                      style={{
                        padding: '7px 16px', border: 'none', borderRadius: 6,
                        fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        background: inputs[prize.id]?.trim() ? '#ffd700' : 'rgba(255,255,255,.08)',
                        color: inputs[prize.id]?.trim() ? '#000' : 'rgba(255,255,255,.3)',
                      }}
                    >
                      Reveal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PrizeRevealControlPanel;
