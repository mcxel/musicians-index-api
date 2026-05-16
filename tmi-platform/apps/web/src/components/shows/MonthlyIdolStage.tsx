"use client";

import type { MonthlyIdolState, IdolWindow } from '@/lib/shows/MonthlyIdolEngine';

interface MonthlyIdolStageProps {
  idolState: MonthlyIdolState;
  onForfeit: (id: string) => void;
  onCrownIdol: (id: string) => void;
}

const WINDOW_LABELS: Record<IdolWindow, string> = {
  MORNING_GLOBAL: 'Morning Global',
  EVENING_7PM: '7 PM Evening',
};

const ROUND_COLOR: Record<string, string> = {
  AUDITION: '#00FFFF',
  SEMI_FINAL: '#FFD700',
  FINAL: '#FF2DAA',
};

export function MonthlyIdolStage({ idolState, onForfeit, onCrownIdol }: MonthlyIdolStageProps) {
  const { currentIdolRound, currentWindow, hallOfFameIds, forfeitCount, contestants, monthlyResetDate } = idolState;
  const active = contestants.filter((c) => c.active && !c.eliminated);
  const roundColor = ROUND_COLOR[currentIdolRound] ?? '#fff';

  return (
    <div
      style={{
        background: 'rgba(3,2,11,0.95)',
        border: '1px solid rgba(255,45,170,0.2)',
        borderRadius: 14,
        padding: '20px 22px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: roundColor,
              border: `1px solid ${roundColor}44`,
              borderRadius: 5,
              padding: '3px 10px',
            }}
          >
            {currentIdolRound.replace('_', ' ')}
          </span>
          <span
            style={{
              fontSize: 9,
              color: '#00FF88',
              border: '1px solid #00FF8844',
              borderRadius: 4,
              padding: '2px 8px',
              fontWeight: 700,
            }}
          >
            {WINDOW_LABELS[currentWindow]}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>RESET DATE</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#FF2DAA' }}>{monthlyResetDate}</div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label: 'ACTIVE', value: String(active.length), color: '#00FFFF' },
          { label: 'FORFEITS', value: String(forfeitCount), color: '#FF4444' },
          { label: 'HALL OF FAME', value: String(hallOfFameIds.length), color: '#FFD700' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${color}33`,
              borderRadius: 7,
              padding: '6px 12px',
              textAlign: 'center',
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Contestant grid */}
      {active.length > 0 ? (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            CONTESTANTS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {active
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    background: i === 0 ? 'rgba(255,45,170,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i === 0 ? 'rgba(255,45,170,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 9,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{c.name}</span>
                    {i === 0 && <span style={{ fontSize: 9, color: '#FF2DAA', fontWeight: 800 }}>LEAD</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: i === 0 ? '#FF2DAA' : '#00FFFF', marginBottom: 8 }}>
                    {c.score.toLocaleString()} pts
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button
                      type="button"
                      onClick={() => onForfeit(c.id)}
                      style={{
                        flex: 1,
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        padding: '4px 0',
                        background: 'rgba(255,68,68,0.1)',
                        border: '1px solid rgba(255,68,68,0.4)',
                        borderRadius: 5,
                        color: '#FF4444',
                        cursor: 'pointer',
                      }}
                    >
                      FORFEIT
                    </button>
                    <button
                      type="button"
                      onClick={() => onCrownIdol(c.id)}
                      style={{
                        flex: 1,
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        padding: '4px 0',
                        background: 'rgba(255,215,0,0.1)',
                        border: '1px solid rgba(255,215,0,0.4)',
                        borderRadius: 5,
                        color: '#FFD700',
                        cursor: 'pointer',
                      }}
                    >
                      CROWN
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
          No active contestants
        </div>
      )}

      {/* Hall of Fame */}
      {hallOfFameIds.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 8 }}>HALL OF FAME</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hallOfFameIds.map((id) => (
              <span
                key={id}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#FFD700',
                  background: 'rgba(255,215,0,0.08)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: 4,
                  padding: '3px 10px',
                }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
