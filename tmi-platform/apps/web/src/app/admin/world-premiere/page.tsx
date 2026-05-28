"use client";

import { useEffect, useState, useCallback } from "react";
import {
  scheduleWorldPremiere,
  firePremiereNow,
  cancelPremiere,
  getPremiereState,
  getPremiereStats,
  msUntilPremiere,
  onPremiereStateChange,
  type PremiereState,
  type PremiereConfig,
} from "@/lib/engines/runtime/WorldPremiereOrchestrator";

// ── Types ─────────────────────────────────────────────────────────────────────

type PremiereStats = ReturnType<typeof getPremiereStats>;

// ── Phase color map ───────────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, string> = {
  idle:          'rgba(255,255,255,0.25)',
  scheduled:     '#FFD700',
  countdown:     '#FF8C00',
  'curtain-drop':'#FF2DAA',
  surge:         '#AA2DFF',
  legendary:     '#00FFFF',
  cooldown:      '#00FF88',
  complete:      '#FFD700',
};

const PHASE_LABELS: Record<string, string> = {
  idle:          'IDLE',
  scheduled:     'SCHEDULED',
  countdown:     'COUNTDOWN',
  'curtain-drop':'CURTAIN DROP',
  surge:         'SURGE',
  legendary:     'LEGENDARY',
  cooldown:      'COOLDOWN',
  complete:      'COMPLETE',
};

// ── Countdown display ─────────────────────────────────────────────────────────

function CountdownDisplay({ ms }: { ms: number | null }) {
  if (ms === null) return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>;
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return (
    <span style={{ color: '#FFD700', fontFamily: 'monospace', fontSize: 28, fontWeight: 900 }}>
      {min > 0 ? `${min}m ` : ''}{sec}s
    </span>
  );
}

// ── Phase timeline ────────────────────────────────────────────────────────────

const PHASES = ['idle', 'scheduled', 'countdown', 'curtain-drop', 'surge', 'legendary', 'cooldown', 'complete'] as const;

function PhaseTimeline({ current }: { current: string }) {
  const idx = PHASES.indexOf(current as typeof PHASES[number]);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      {PHASES.filter(p => p !== 'idle').map((phase, i) => {
        const phaseIdx = PHASES.indexOf(phase);
        const isActive = phase === current;
        const isPast = idx > phaseIdx;
        const color = PHASE_COLORS[phase] ?? '#fff';
        return (
          <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <div style={{ width: 16, height: 1, background: isPast || isActive ? color : 'rgba(255,255,255,0.12)' }} />}
            <div style={{
              padding: '3px 8px',
              borderRadius: 999,
              border: `1px solid ${isActive ? color : isPast ? `${color}55` : 'rgba(255,255,255,0.1)'}`,
              background: isActive ? `${color}22` : 'transparent',
              color: isActive ? color : isPast ? `${color}88` : 'rgba(255,255,255,0.25)',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.1em',
              transition: 'all 0.3s',
            }}>
              {PHASE_LABELS[phase]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorldPremierePage() {
  const [premiereState, setPremiereState] = useState<PremiereState>(getPremiereState);
  const [stats, setStats] = useState<PremiereStats>(getPremiereStats);
  const [msLeft, setMsLeft] = useState<number | null>(msUntilPremiere);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("World Premiere");
  const [performerId, setPerformerId] = useState("");
  const [roomIds, setRoomIds] = useState("room-1,room-2");
  const [delayMin, setDelayMin] = useState(5);

  // Subscribe to premiere state changes
  useEffect(() => {
    const unsub = onPremiereStateChange((s) => {
      setPremiereState(s);
      setStats(getPremiereStats());
    });
    return unsub;
  }, []);

  // Tick countdown display + refresh stats
  useEffect(() => {
    const interval = setInterval(() => {
      setMsLeft(msUntilPremiere());
      setStats(getPremiereStats());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const parsedRoomIds = roomIds.split(',').map(r => r.trim()).filter(Boolean);

  const handleSchedule = useCallback(() => {
    setError(null);
    if (!title.trim() || !performerId.trim() || parsedRoomIds.length === 0) {
      setError("Title, performer ID, and at least one room ID are required.");
      return;
    }
    try {
      const config: PremiereConfig = { title: title.trim(), performerId: performerId.trim(), roomIds: parsedRoomIds, countdownSec: 60, surgeDurationSec: 15, legendaryWindowSec: 30 };
      scheduleWorldPremiere(config, delayMin * 60 * 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Schedule failed.");
    }
  }, [title, performerId, parsedRoomIds, delayMin]);

  const handleFireNow = useCallback(() => {
    setError(null);
    if (!title.trim() || !performerId.trim() || parsedRoomIds.length === 0) {
      setError("Title, performer ID, and at least one room ID are required.");
      return;
    }
    try {
      firePremiereNow({ title: title.trim(), performerId: performerId.trim(), roomIds: parsedRoomIds });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fire now failed.");
    }
  }, [title, performerId, parsedRoomIds]);

  const handleCancel = useCallback(() => {
    setError(null);
    cancelPremiere();
  }, []);

  const phaseColor = PHASE_COLORS[premiereState.phase] ?? '#fff';
  const isActive = !['idle', 'complete'].includes(premiereState.phase);

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', color: '#fff', fontFamily: 'monospace', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#AA2DFF', fontWeight: 900, marginBottom: 6 }}>
            WORLD PREMIERE ORCHESTRATOR
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.05em', color: '#fff' }}>
            Cross-Venue Premiere Control
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Synchronized premiere sequence across all active rooms. Every avatar experiences the same moment.
          </div>
        </div>

        {/* Phase status */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${phaseColor}44`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: phaseColor,
                boxShadow: isActive ? `0 0 10px ${phaseColor}` : 'none',
                animation: isActive ? 'pulse 1.2s ease-in-out infinite' : 'none',
              }} />
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', color: phaseColor }}>
                {PHASE_LABELS[premiereState.phase] ?? premiereState.phase.toUpperCase()}
              </span>
            </div>
            {isActive && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                Time to premiere: <CountdownDisplay ms={msLeft} />
              </div>
            )}
          </div>
          <PhaseTimeline current={premiereState.phase} />
        </div>

        {/* Active premiere info */}
        {premiereState.config && (
          <div style={{ background: 'rgba(170,45,255,0.07)', border: '1px solid rgba(170,45,255,0.25)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#AA2DFF', marginBottom: 8 }}>PREMIERE DETAILS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {[
                { label: 'Title', value: premiereState.config.title },
                { label: 'Performer', value: premiereState.config.performerId },
                { label: 'Rooms', value: premiereState.config.roomIds.join(', ') },
                { label: 'Countdown', value: `${premiereState.config.countdownSec}s` },
                { label: 'Surge Window', value: `${premiereState.config.surgeDurationSec}s` },
                { label: 'Legendary Window', value: `${premiereState.config.legendaryWindowSec}s` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#fff', wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'ROOMS', value: stats.roomCount, color: '#00FFFF' },
            { label: 'SNAPSHOT', value: stats.snapshotCaptured ? 'CAPTURED' : '—', color: stats.snapshotCaptured ? '#00FF88' : 'rgba(255,255,255,0.25)' },
            { label: 'ARTIFACT', value: stats.artifactGenerated ? 'GENERATED' : '—', color: stats.artifactGenerated ? '#00FF88' : 'rgba(255,255,255,0.25)' },
            { label: 'MYTH', value: stats.mythGenerated ? 'CREATED' : '—', color: stats.mythGenerated ? '#FFD700' : 'rgba(255,255,255,0.25)' },
            { label: 'HEARTBEAT', value: stats.heartbeatActive ? 'ACTIVE' : 'OFF', color: stats.heartbeatActive ? '#00FF88' : '#FF2DAA' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color }}>{String(value)}</div>
            </div>
          ))}
        </div>

        {/* Config form */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#00FFFF', marginBottom: 14 }}>PREMIERE CONFIGURATION</div>

          {error && (
            <div style={{ background: 'rgba(255,45,45,0.12)', border: '1px solid rgba(255,45,45,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>TITLE</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isActive}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, fontFamily: 'monospace',
                  outline: 'none', boxSizing: 'border-box', opacity: isActive ? 0.5 : 1,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>PERFORMER ID</label>
              <input
                value={performerId}
                onChange={e => setPerformerId(e.target.value)}
                disabled={isActive}
                placeholder="user_abc123"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, fontFamily: 'monospace',
                  outline: 'none', boxSizing: 'border-box', opacity: isActive ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>ROOM IDs (comma-separated)</label>
              <input
                value={roomIds}
                onChange={e => setRoomIds(e.target.value)}
                disabled={isActive}
                placeholder="room-1,room-2,room-3"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, fontFamily: 'monospace',
                  outline: 'none', boxSizing: 'border-box', opacity: isActive ? 0.5 : 1,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>
                SCHEDULED DELAY (minutes): {delayMin}m
              </label>
              <input
                type="range"
                min={1} max={60} step={1}
                value={delayMin}
                onChange={e => setDelayMin(Number(e.target.value))}
                disabled={isActive}
                style={{ width: '100%', accentColor: '#FFD700', marginTop: 8, opacity: isActive ? 0.5 : 1 }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSchedule}
              disabled={isActive}
              style={{
                padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,215,0,0.4)',
                background: 'rgba(255,215,0,0.1)', color: '#FFD700', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.1em', cursor: isActive ? 'not-allowed' : 'pointer', opacity: isActive ? 0.5 : 1,
              }}
            >
              SCHEDULE ({delayMin}m)
            </button>
            <button
              type="button"
              onClick={handleFireNow}
              disabled={isActive}
              style={{
                padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.4)',
                background: 'rgba(255,45,170,0.1)', color: '#FF2DAA', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.1em', cursor: isActive ? 'not-allowed' : 'pointer', opacity: isActive ? 0.5 : 1,
              }}
            >
              FIRE NOW (5s countdown)
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={!isActive}
              style={{
                padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,80,80,0.4)',
                background: 'rgba(255,80,80,0.1)', color: '#FF6B6B', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.1em', cursor: !isActive ? 'not-allowed' : 'pointer', opacity: !isActive ? 0.5 : 1,
              }}
            >
              CANCEL PREMIERE
            </button>
          </div>
        </div>

        {/* Phase log */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>PHASE LOG</div>
          {premiereState.phaseLogs.length === 0 ? (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>No events yet. Schedule or fire a premiere to begin.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...premiereState.phaseLogs].reverse().map((log, i) => {
                const color = PHASE_COLORS[log.phase] ?? '#fff';
                const ts = new Date(log.timestamp).toLocaleTimeString();
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', flexShrink: 0, paddingTop: 1 }}>{ts}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', color,
                      flexShrink: 0, paddingTop: 1,
                    }}>
                      [{PHASE_LABELS[log.phase] ?? log.phase}]
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{log.detail}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Artifact IDs (if captured) */}
        {(premiereState.snapshotId || premiereState.artifactBundleId || premiereState.mythId) && (
          <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, padding: 16, marginTop: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#00FF88', marginBottom: 10 }}>CAPTURED ARTIFACTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {premiereState.snapshotId && (
                <div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>SNAPSHOT ID</div>
                  <div style={{ fontSize: 10, color: '#00FF88', wordBreak: 'break-all' }}>{premiereState.snapshotId}</div>
                </div>
              )}
              {premiereState.artifactBundleId && (
                <div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>ARTIFACT BUNDLE</div>
                  <div style={{ fontSize: 10, color: '#00FFFF', wordBreak: 'break-all' }}>{premiereState.artifactBundleId}</div>
                </div>
              )}
              {premiereState.mythId && (
                <div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>MYTH ID</div>
                  <div style={{ fontSize: 10, color: '#FFD700', wordBreak: 'break-all' }}>{premiereState.mythId}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
