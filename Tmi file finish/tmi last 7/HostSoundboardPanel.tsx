/**
 * HostSoundboardPanel.tsx
 * Repo: apps/web/src/components/host/HostSoundboardPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';

interface HostSoundboardPanelProps {
  onPlay?: (soundId: string) => void;
}

const SOUND_CUES = [
  { id: 'fanfare',    label: '🎺 Winner Fanfare',    color: '#ffd700' },
  { id: 'drums',      label: '🥁 Drum Roll',          color: '#ff6b1a' },
  { id: 'stinger',    label: '⚡ Winner Stinger',     color: '#00e5ff' },
  { id: 'applause',   label: '👏 Applause',           color: '#00c853' },
  { id: 'chime',      label: '🔔 Transition Chime',   color: '#c0c0c0' },
  { id: 'transition', label: '🎵 Round Transition',   color: '#9c27b0' },
];

export function HostSoundboardPanel({ onPlay }: HostSoundboardPanelProps) {
  const [playing, setPlaying] = useState<string | null>(null);

  const trigger = (id: string) => {
    setPlaying(id);
    onPlay?.(id);
    setTimeout(() => setPlaying(null), 2000);
  };

  return (
    <div style={{
      background: '#0a0d14',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
        Soundboard
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {SOUND_CUES.map(cue => {
          const isPlaying = playing === cue.id;
          return (
            <button
              key={cue.id}
              onClick={() => trigger(cue.id)}
              style={{
                padding: '14px 10px', cursor: 'pointer', textAlign: 'center',
                background: isPlaying ? `${cue.color}22` : 'rgba(255,255,255,.03)',
                border: `1px solid ${isPlaying ? cue.color : 'rgba(255,255,255,.08)'}`,
                borderRadius: 8,
                color: isPlaying ? cue.color : 'rgba(255,255,255,.7)',
                fontSize: 12, fontWeight: isPlaying ? 700 : 400,
                transition: 'all .2s',
                boxShadow: isPlaying ? `0 0 12px ${cue.color}44` : 'none',
              }}
            >
              {cue.label}
              {isPlaying && (
                <div style={{ fontSize: 10, marginTop: 4, color: cue.color }}>Playing…</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HostSoundboardPanel;
