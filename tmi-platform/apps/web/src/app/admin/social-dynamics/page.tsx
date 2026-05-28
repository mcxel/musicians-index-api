'use client';

import { useState, useMemo, useCallback } from 'react';
import SocialHeatmapReplay, { type ReplayFrame, type ReplayAvatar } from '@/components/admin/SocialHeatmapReplay';
import {
  directAttention,
  focusRoomOnStage,
  triggerApplause,
  triggerCrowdWave,
  applyIdleDrift,
  getAttentionStats,
  getRoomAttentionVectors,
  type CrowdWaveDirection,
} from '@/lib/engines/runtime/CrowdAttentionEngine';
import {
  syncRoomAttendance,
  recordLegendaryMoment,
  getMomentumStats,
  getMomentumLog,
  getRankedAffinities,
  getMomentumPhase,
  type MomentumPhase,
} from '@/lib/engines/runtime/RelationshipMomentumEngine';

// ── Seed users ─────────────────────────────────────────────────────────────────

const USERS = [
  { id: 'u-atlas',  name: 'Atlas',  role: 'performer', emotionalState: 'performer' },
  { id: 'u-nova',   name: 'Nova',   role: 'fan',       emotionalState: 'social' },
  { id: 'u-cipher', name: 'Cipher', role: 'artist',    emotionalState: 'loyal' },
  { id: 'u-lyra',   name: 'Lyra',   role: 'fan',       emotionalState: 'generous' },
  { id: 'u-storm',  name: 'Storm',  role: 'vip',       emotionalState: 'legendary' },
  { id: 'u-echo',   name: 'Echo',   role: 'sponsor',   emotionalState: 'observer' },
  { id: 'u-sol',    name: 'Sol',    role: 'fan',       emotionalState: 'newcomer' },
  { id: 'u-relic',  name: 'Relic',  role: 'performer', emotionalState: 'performer' },
  { id: 'u-prism',  name: 'Prism',  role: 'fan',       emotionalState: 'social' },
  { id: 'u-vanta',  name: 'Vanta',  role: 'host',      emotionalState: 'loyal' },
];

const ROWS = 2, COLS = 5;

const PHASE_COLORS: Record<MomentumPhase, string> = {
  new:      'rgba(255,255,255,0.3)',
  building: '#00FFFF',
  bonded:   '#00FF88',
  peak:     '#FFD700',
  cooling:  '#FF9500',
  drifting: '#FF2DAA',
  fading:   'rgba(255,255,255,0.2)',
};

const PHASE_ICONS: Record<MomentumPhase, string> = {
  new: '✦', building: '↑', bonded: '🔗', peak: '⚡',
  cooling: '↓', drifting: '~', fading: '○',
};

// ── Frame builder ─────────────────────────────────────────────────────────────

function buildFrame(label: string, isLegendary = false): ReplayFrame {
  const ids = USERS.map((u) => u.id);
  const vectors = getRoomAttentionVectors(ids);

  const avatars: ReplayAvatar[] = USERS.map((user, i) => {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const vec = vectors.find((v) => v.avatarId === user.id);
    return {
      id: user.id,
      name: user.name,
      row, col,
      energy: 0.3 + Math.random() * 0.6,
      headYaw: vec?.yaw ?? 0,
      headPitch: vec?.pitch ?? 0,
      attentionTarget: vec?.targetLabel ?? 'stage',
      emotionalState: user.emotionalState,
      affinityCluster: i < 4 ? 'front-cluster' : i < 8 ? 'mid-cluster' : 'back-cluster',
      isInLegendaryMoment: isLegendary && Math.random() > 0.5,
    };
  });

  return { timestampMs: Date.now(), label, avatars };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SocialDynamicsPage() {
  const [frames, setFrames] = useState<ReplayFrame[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const [selectedUserA, setSelectedUserA] = useState('u-nova');
  const [selectedUserB, setSelectedUserB] = useState('u-atlas');

  const ids = USERS.map((u) => u.id);
  const addLog = (msg: string) => setLog((l) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l.slice(0, 29)]);

  function capture(label: string, legendary = false) {
    setFrames((f) => [...f, buildFrame(label, legendary)]);
  }

  // ── Attention controls ──────────────────────────────────────────────────────

  function handleFocusStage() {
    focusRoomOnStage('room-main', ids, undefined, 0.9);
    addLog('Focused all avatars on stage (bond-clustered timing)');
    setTimeout(() => { capture('Stage Focus'); setTick((t) => t + 1); }, 300);
  }

  function handleApplause() {
    triggerApplause(ids, 0.88);
    addLog('Applause triggered — front rows max intensity');
    setTimeout(() => { capture('Applause'); setTick((t) => t + 1); }, 500);
  }

  function handleWave(dir: CrowdWaveDirection) {
    const wave = triggerCrowdWave(ids, dir, ids[0]!);
    addLog(`Crowd wave triggered: ${dir} (ID: ${wave.id.slice(-6)})`);
    setTimeout(() => { capture(`Wave: ${dir}`); setTick((t) => t + 1); }, 800);
  }

  function handleIdleDrift() {
    applyIdleDrift(ids, 'room-main');
    addLog('Idle drift applied — avatars looking around naturally');
    capture('Idle Drift');
    setTick((t) => t + 1);
  }

  function handleLegendaryAttention() {
    focusRoomOnStage('room-main', ids, 'u-atlas', 1.0);
    addLog('LEGENDARY — all eyes on Atlas, max intensity');
    setTimeout(() => { capture('Legendary Moment', true); setTick((t) => t + 1); }, 400);
  }

  // ── Familiarity test ────────────────────────────────────────────────────────

  function runFamiliarityTest() {
    addLog(`--- FAMILIARITY TEST: Session ${sessionCount + 1} ---`);

    // Session 1: everyone attends
    const present = ids;
    syncRoomAttendance(present, ids);
    addLog(`Session ${sessionCount + 1}: All users present → momentum updated`);

    // Focus on stage at session start
    focusRoomOnStage('room-main', ids, undefined, 0.6);
    capture(`Session ${sessionCount + 1} — Open`);

    // Mid-session: energy builds
    setTimeout(() => {
      triggerApplause(ids, 0.7);
      capture(`Session ${sessionCount + 1} — Applause`);
      addLog(`Session ${sessionCount + 1}: Mid-session applause captured`);
    }, 200);

    // End of session: legendary moment
    setTimeout(() => {
      recordLegendaryMoment('u-nova', 'u-atlas');
      recordLegendaryMoment('u-storm', 'u-cipher');
      focusRoomOnStage('room-main', ids, 'u-atlas', 1.0);
      capture(`Session ${sessionCount + 1} — Legendary`, true);
      addLog(`Session ${sessionCount + 1}: Legendary moment recorded`);
      setTick((t) => t + 1);
    }, 400);

    setSessionCount((c) => c + 1);
  }

  // ── Momentum stats ──────────────────────────────────────────────────────────

  const momentumStats = useMemo(() => getMomentumStats(), [tick]);
  const momentumLog = useMemo(() => getMomentumLog(12), [tick]);
  const affinitiesA = useMemo(() => getRankedAffinities(selectedUserA, 6), [selectedUserA, tick]);
  const phasePair = useMemo(() => getMomentumPhase(selectedUserA, selectedUserB), [selectedUserA, selectedUserB, tick]);

  const attnStats = useMemo(() => getAttentionStats(ids), [tick]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#0a0412', color: '#fff', fontFamily: 'monospace', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>
          TMI Admin — Social Intelligence
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '0.04em', color: '#FF2DAA' }}>
          Social Dynamics Deck
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', maxWidth: 680 }}>
          Crowd attention control, relationship momentum tracking, and forensic heatmap replay.
          Run the familiarity test to watch clusters reform across sessions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left: Replay + Attention controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Replay component */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
            <SocialHeatmapReplay
              frames={frames}
              rows={ROWS}
              cols={COLS}
              accentColor="#FF2DAA"
              autoPlay={false}
            />
          </div>

          {/* Attention controls */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>
              Crowd Attention Controls
            </div>

            {/* Attention stats */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              {[
                { label: 'On Stage', value: `${attnStats.stagePercent}%`, color: '#00FFFF' },
                { label: 'Idle', value: `${attnStats.idlePercent}%`, color: 'rgba(255,255,255,0.4)' },
                { label: 'Avg Intensity', value: attnStats.avgIntensity.toFixed(2), color: '#FF2DAA' },
                { label: 'Active Waves', value: attnStats.activeWaveCount, color: '#FFD700' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '6px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: '🎤 Focus Stage', fn: handleFocusStage, color: '#00FFFF' },
                { label: '👏 Applause', fn: handleApplause, color: '#FF2DAA' },
                { label: '🌊 Wave L→R', fn: () => handleWave('left-to-right'), color: '#AA2DFF' },
                { label: '🌊 Wave R→L', fn: () => handleWave('right-to-left'), color: '#AA2DFF' },
                { label: '🌊 Wave F→B', fn: () => handleWave('front-to-back'), color: '#AA2DFF' },
                { label: '💭 Idle Drift', fn: handleIdleDrift, color: 'rgba(255,255,255,0.5)' },
                { label: '⚡ Legendary Focus', fn: handleLegendaryAttention, color: '#FFD700' },
              ].map(({ label, fn, color }) => (
                <button key={label} onClick={fn} style={{
                  padding: '8px 14px', background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${color}55`, borderRadius: 6,
                  color, fontSize: 9, fontWeight: 900, letterSpacing: '0.08em',
                  cursor: 'pointer', textTransform: 'uppercase',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Familiarity Test */}
          <div style={{ background: 'rgba(255,45,170,0.06)', border: '1px solid rgba(255,45,170,0.25)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                  Familiarity Test
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  Run sessions → watch clusters reform. Session {sessionCount} completed.
                </div>
              </div>
              <button onClick={runFamiliarityTest} style={{
                padding: '10px 20px', background: '#FF2DAA',
                border: 'none', borderRadius: 7, color: '#0a0412',
                fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase',
              }}>
                ▶ RUN SESSION {sessionCount + 1}
              </button>
            </div>

            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              Each session call updates momentum for all pairs. After 3+ sessions,
              bonded pairs enter the <span style={{ color: '#00FF88' }}>bonded</span> or <span style={{ color: '#FFD700' }}>peak</span> phase
              and their seating clusters naturally re-form. The "alive" test:
              run twice, reset room, observe if clusters persist.
            </div>
          </div>

          {/* Activity log */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, maxHeight: 180, overflowY: 'auto' }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Activity</div>
            {log.length === 0 ? (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>No activity yet</div>
            ) : log.map((line, i) => (
              <div key={i} style={{ fontSize: 9, color: i === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{line}</div>
            ))}
          </div>
        </div>

        {/* Right: Momentum panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Global momentum stats */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Relationship Momentum
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total Pairs', value: momentumStats.totalPairs, color: '#AA2DFF' },
                { label: 'Bonded', value: momentumStats.bondedPairs, color: '#00FF88' },
                { label: 'Cooling', value: momentumStats.coolingPairs, color: '#FF9500' },
                { label: 'Fading', value: momentumStats.fadingPairs, color: 'rgba(255,255,255,0.3)' },
                { label: 'Avg Affinity', value: `${Math.round(momentumStats.avgAffinity * 100)}%`, color: '#FF2DAA' },
                { label: 'Avg Momentum', value: momentumStats.avgMomentum.toFixed(3), color: '#00FFFF' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Phase breakdown */}
            {Object.entries(momentumStats.phaseBreakdown).length > 0 && (
              <>
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 6 }}>Phase Breakdown</div>
                {(Object.entries(momentumStats.phaseBreakdown) as [MomentumPhase, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([phase, count]) => (
                    <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10 }}>{PHASE_ICONS[phase]}</span>
                      <span style={{ fontSize: 9, color: PHASE_COLORS[phase], fontWeight: 700, width: 60, textTransform: 'capitalize' }}>{phase}</span>
                      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(count / (momentumStats.totalPairs || 1)) * 100}%`, height: '100%', background: PHASE_COLORS[phase], borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', width: 16, textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Pair inspector */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 10 }}>
              Pair Inspector
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select value={selectedUserA} onChange={(e) => setSelectedUserA(e.target.value)} style={selectStyle}>
                {USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>↔</span>
              <select value={selectedUserB} onChange={(e) => setSelectedUserB(e.target.value)} style={selectStyle}>
                {USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${PHASE_COLORS[phasePair]}22`, border: `1px solid ${PHASE_COLORS[phasePair]}55`, borderRadius: 6 }}>
              <span style={{ fontSize: 16 }}>{PHASE_ICONS[phasePair]}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: PHASE_COLORS[phasePair], textTransform: 'capitalize' }}>{phasePair}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>momentum phase</div>
              </div>
            </div>

            {/* Top affinities for selected user */}
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 }}>
              {USERS.find((u) => u.id === selectedUserA)?.name}'s Top Affinities
            </div>
            {affinitiesA.length === 0 ? (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>No data — run sessions</div>
            ) : (
              affinitiesA.map((a) => {
                const name = USERS.find((u) => u.id === a.userId)?.name ?? a.userId;
                const phaseColor = PHASE_COLORS[a.phase];
                return (
                  <div key={a.userId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 9 }}>{PHASE_ICONS[a.phase]}</span>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 700, width: 44 }}>{name}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${a.affinity * 100}%`, height: '100%', background: phaseColor, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 8, color: phaseColor, fontWeight: 900, width: 30, textAlign: 'right' }}>
                      {Math.round(a.affinity * 100)}%
                    </span>
                    <span style={{ fontSize: 7, color: a.momentum > 0 ? '#00FF88' : '#FF2DAA', width: 36, textAlign: 'right' }}>
                      {a.momentum > 0 ? '+' : ''}{a.momentum.toFixed(3)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Momentum event log */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>
              Momentum Events
            </div>
            {momentumLog.length === 0 ? (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>No events — run familiarity test</div>
            ) : momentumLog.map((ev, i) => {
              const phaseColor = PHASE_COLORS[ev.phase];
              const [a, b] = ev.pairKey.split(':');
              const nameA = USERS.find((u) => u.id === a)?.name ?? a;
              const nameB = USERS.find((u) => u.id === b)?.name ?? b;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize: 8 }}>
                  <span style={{ color: phaseColor }}>{PHASE_ICONS[ev.phase]}</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{nameA}↔{nameB}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', flex: 1, textTransform: 'capitalize' }}>{ev.type}</span>
                  <span style={{ color: ev.delta > 0 ? '#00FF88' : '#FF2DAA', fontWeight: 900 }}>
                    {ev.delta > 0 ? '+' : ''}{ev.delta.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 5,
  color: '#fff',
  padding: '6px 8px',
  fontSize: 10,
  fontFamily: 'monospace',
  cursor: 'pointer',
};
