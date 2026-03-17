/**
 * CoHostHandoffPanel.tsx
 * Repo: apps/web/src/components/host/CoHostHandoffPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';

interface CoHostHandoffPanelProps {
  primaryHostName?: string;
  coHostName?: string;
  onHandoff?: (activeSide: 'primary' | 'cohost') => void;
}

export function CoHostHandoffPanel({
  primaryHostName = 'Ray Journey',
  coHostName = 'Co-Host',
  onHandoff,
}: CoHostHandoffPanelProps) {
  const [active, setActive] = useState<'primary' | 'cohost'>('primary');

  const switchTo = (side: 'primary' | 'cohost') => {
    setActive(side);
    onHandoff?.(side);
  };

  return (
    <div style={{
      background: '#0a0d14',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
        Co-Host Handoff
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {([
          { key: 'primary', label: primaryHostName },
          { key: 'cohost',  label: coHostName },
        ] as const).map(h => {
          const isActive = active === h.key;
          return (
            <button
              key={h.key}
              onClick={() => switchTo(h.key)}
              style={{
                padding: '16px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                background: isActive ? 'rgba(0,229,255,.1)' : 'rgba(255,255,255,.03)',
                border: `2px solid ${isActive ? '#00e5ff' : 'rgba(255,255,255,.08)'}`,
                color: isActive ? '#00e5ff' : 'rgba(255,255,255,.5)',
                transition: 'all .2s',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>{isActive ? '🎙' : '⏸'}</div>
              <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 400 }}>{h.label}</div>
              {isActive && (
                <div style={{ fontSize: 10, marginTop: 4, color: '#00e5ff', fontWeight: 700 }}>LIVE</div>
              )}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 10, textAlign: 'center' }}>
        Currently live: {active === 'primary' ? primaryHostName : coHostName}
      </p>
    </div>
  );
}

export default CoHostHandoffPanel;
