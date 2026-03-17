/**
 * ContestProgressBanner.tsx
 * Repo: apps/web/src/components/contest/ContestProgressBanner.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { CheckCircle } from 'lucide-react';

type ContestPhase = 'registration' | 'qualifying' | 'competing' | 'voting' | 'finals' | 'complete';

interface ContestProgressBannerProps {
  currentPhase: ContestPhase;
}

const PHASES: { id: ContestPhase; label: string }[] = [
  { id: 'registration', label: 'Registration' },
  { id: 'qualifying',   label: 'Qualifying' },
  { id: 'competing',    label: 'Competing' },
  { id: 'voting',       label: 'Voting' },
  { id: 'finals',       label: 'Finals' },
  { id: 'complete',     label: 'Complete' },
];

export function ContestProgressBanner({ currentPhase }: ContestProgressBannerProps) {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {PHASES.map((phase, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          const color  = active ? '#ff6b1a' : done ? 'rgba(255,107,26,.6)' : 'rgba(255,255,255,.2)';

          return (
            <div key={phase.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* connector line */}
              {i > 0 && (
                <div style={{
                  position: 'absolute', top: 10, right: '50%', width: '100%', height: 2,
                  background: done ? 'rgba(255,107,26,.5)' : 'rgba(255,255,255,.06)',
                }} />
              )}
              {/* circle */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%', position: 'relative', zIndex: 1,
                background: active ? '#ff6b1a' : done ? 'rgba(255,107,26,.15)' : 'rgba(255,255,255,.06)',
                border: `2px solid ${active ? '#ff6b1a' : done ? 'rgba(255,107,26,.4)' : 'rgba(255,255,255,.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 6,
              }}>
                {done   && <CheckCircle size={12} color="#ff6b1a" />}
                {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
              {/* label */}
              <span style={{
                fontSize: 9, textAlign: 'center', whiteSpace: 'nowrap',
                fontWeight: active ? 700 : 400, color,
              }}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContestProgressBanner;
