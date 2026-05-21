/**
 * SoundClueTrigger.tsx
 * Repo: apps/web/src/components/game/SoundClueTrigger.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface SoundClue { id: string; label: string; durationSeconds: number; }
interface SoundClueTriggerProps {
  clues?: SoundClue[];
  adminMode?: boolean;
  onPlay?: (clueId: string) => void;
}

export function SoundClueTrigger({ clues = [], adminMode = false, onPlay }: SoundClueTriggerProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handlePlay = (clue: SoundClue) => {
    if (playing === clue.id) { setPlaying(null); setProgress(0); return; }
    setPlaying(clue.id);
    setProgress(0);
    onPlay?.(clue.id);
    // Simulate progress for visual feedback
    const steps = clue.durationSeconds * 10;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) { clearInterval(interval); setPlaying(null); setProgress(0); }
    }, 100);
  };

  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Volume2 size={16} color="#00e5ff" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff' }}>Sound Clues {adminMode && '(Admin)'}</span>
      </div>

      {clues.length === 0 ? (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>No sound clues configured for this round.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clues.map(clue => (
            <div key={clue.id} style={{ padding: '12px 14px', background: playing === clue.id ? 'rgba(0,229,255,.06)' : 'rgba(255,255,255,.03)', border: `1px solid ${playing === clue.id ? 'rgba(0,229,255,.3)' : 'rgba(255,255,255,.07)'}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: playing === clue.id ? 8 : 0 }}>
                <button
                  onClick={() => handlePlay(clue)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: playing === clue.id ? '#00e5ff' : 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  {playing === clue.id ? <Pause size={14} color="#000" /> : <Play size={14} color="#00e5ff" />}
                </button>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#fff' }}>{clue.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{clue.durationSeconds}s</span>
              </div>
              {playing === clue.id && (
                <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#00e5ff', borderRadius: 2, transition: 'width .1s linear' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default SoundClueTrigger;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * AudienceGuessPanel.tsx
 * Repo: apps/web/src/components/game/AudienceGuessPanel.tsx
 * Action: CREATE | Wave: W2
 */
interface GuessOption { id: string; label: string; votes: number; isCorrect?: boolean; }
interface AudienceGuessPanelProps {
  question?: string;
  options?: GuessOption[];
  totalVotes?: number;
  revealed?: boolean;
  onGuess?: (optionId: string) => void;
}

export function AudienceGuessPanel({ question = 'What is your guess?', options = [], totalVotes = 0, revealed = false, onGuess }: AudienceGuessPanelProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleGuess = (optionId: string) => {
    if (selected || revealed) return;
    setSelected(optionId);
    onGuess?.(optionId);
  };

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.4 }}>{question}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(option => {
          const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selected === option.id;
          const correctStyle = revealed && option.isCorrect;
          const wrongStyle = revealed && isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleGuess(option.id)}
              disabled={!!selected || revealed}
              style={{
                padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: (selected || revealed) ? 'default' : 'pointer',
                background: correctStyle ? 'rgba(0,200,83,.1)' : wrongStyle ? 'rgba(255,82,82,.1)' : isSelected ? 'rgba(255,107,26,.1)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${correctStyle ? 'rgba(0,200,83,.4)' : wrongStyle ? 'rgba(255,82,82,.3)' : isSelected ? 'rgba(255,107,26,.3)' : 'rgba(255,255,255,.07)'}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {revealed && (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(255,255,255,.04) ${pct}%, transparent ${pct}%)` }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <span style={{ fontSize: 13, fontWeight: correctStyle ? 700 : 400, color: correctStyle ? '#00c853' : wrongStyle ? '#ff5252' : '#fff' }}>
                  {correctStyle && '✓ '}{wrongStyle && '✗ '}{option.label}
                </span>
                {revealed && (
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{pct.toFixed(0)}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {totalVotes > 0 && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,.3)', textAlign: 'right' }}>
          {totalVotes.toLocaleString()} total responses
        </div>
      )}
    </div>
  );
}
