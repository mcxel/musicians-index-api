/**
 * AudienceGuessPanel.tsx
 * Repo: apps/web/src/components/game/AudienceGuessPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';

interface GuessOption {
  id: string;
  label: string;
  votes: number;
  isCorrect?: boolean;
}

interface AudienceGuessPanelProps {
  question?: string;
  options?: GuessOption[];
  totalVotes?: number;
  revealed?: boolean;
  onGuess?: (optionId: string) => void;
}

export function AudienceGuessPanel({
  question = 'What is your guess?',
  options = [],
  totalVotes = 0,
  revealed = false,
  onGuess,
}: AudienceGuessPanelProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleGuess = (optionId: string) => {
    if (selected || revealed) return;
    setSelected(optionId);
    onGuess?.(optionId);
  };

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: 12, padding: 20,
    }}>
      {/* Question */}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.4 }}>
        {question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(option => {
          const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selected === option.id;
          const correct = revealed && option.isCorrect;
          const wrong   = revealed && isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleGuess(option.id)}
              disabled={!!selected || revealed}
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '12px 14px', textAlign: 'left', borderRadius: 10,
                cursor: (selected || revealed) ? 'default' : 'pointer',
                background: correct  ? 'rgba(0,200,83,.1)'
                          : wrong    ? 'rgba(255,82,82,.1)'
                          : isSelected ? 'rgba(255,107,26,.1)'
                          : 'rgba(255,255,255,.03)',
                border: `1px solid ${
                  correct    ? 'rgba(0,200,83,.4)'
                : wrong      ? 'rgba(255,82,82,.3)'
                : isSelected ? 'rgba(255,107,26,.3)'
                : 'rgba(255,255,255,.07)'
                }`,
                transition: 'all .2s',
              }}
            >
              {/* Progress fill behind text */}
              {revealed && (
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: `linear-gradient(90deg, rgba(255,255,255,.04) ${pct}%, transparent ${pct}%)`,
                }} />
              )}

              {/* Label row */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 13, fontWeight: correct ? 700 : 400,
                  color: correct ? '#00c853' : wrong ? '#ff5252' : '#fff',
                }}>
                  {correct && '✓ '}
                  {wrong   && '✗ '}
                  {option.label}
                </span>
                {revealed && (
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>
                    {pct.toFixed(0)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {options.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13, padding: '16px 0' }}>
            No options configured for this question.
          </p>
        )}
      </div>

      {/* Footer */}
      {totalVotes > 0 && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,.3)', textAlign: 'right' }}>
          {totalVotes.toLocaleString()} total responses
        </div>
      )}
    </div>
  );
}

export default AudienceGuessPanel;
