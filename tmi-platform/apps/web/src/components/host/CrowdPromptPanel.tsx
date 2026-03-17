/**
 * CrowdPromptPanel.tsx
 * Repo: apps/web/src/components/host/CrowdPromptPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';

interface CrowdPromptPanelProps {
  onTrigger?: (prompt: string) => void;
}

const CROWD_PROMPTS = [
  { id: 'noise',    label: 'Make some noise! 🔊',          emoji: '🔊' },
  { id: 'applause', label: 'Give a round of applause! 👏', emoji: '👏' },
  { id: 'standup',  label: 'Everybody stand up! 🎉',       emoji: '🎉' },
  { id: 'louder',   label: 'Let me hear you! 📣',          emoji: '📣' },
  { id: 'scream',   label: 'Scream for your favorite! 🏆', emoji: '🏆' },
  { id: 'wave',     label: 'Wave your hands! 🙌',          emoji: '🙌' },
];

export function CrowdPromptPanel({ onTrigger }: CrowdPromptPanelProps) {
  const [fired, setFired] = useState<string | null>(null);

  const trigger = (prompt: typeof CROWD_PROMPTS[0]) => {
    setFired(prompt.id);
    onTrigger?.(prompt.label);
    setTimeout(() => setFired(null), 1500);
  };

  return (
    <div style={{
      background: '#0a0d14',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#ff6b1a', marginBottom: 12 }}>
        Crowd Prompts
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CROWD_PROMPTS.map(prompt => {
          const isFired = fired === prompt.id;
          return (
            <button
              key={prompt.id}
              onClick={() => trigger(prompt)}
              style={{
                padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                background: isFired ? 'rgba(255,107,26,.15)' : 'rgba(255,107,26,.05)',
                border: `1px solid ${isFired ? 'rgba(255,107,26,.5)' : 'rgba(255,107,26,.15)'}`,
                borderRadius: 8, color: isFired ? '#fff' : 'rgba(255,255,255,.8)',
                fontSize: 13, fontWeight: isFired ? 700 : 400,
                transition: 'all .15s',
              }}
            >
              {isFired ? '✓ Fired! ' : ''}{prompt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CrowdPromptPanel;
