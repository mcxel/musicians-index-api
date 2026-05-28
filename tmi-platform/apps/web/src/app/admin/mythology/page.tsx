'use client';

import { useState, useMemo } from 'react';
import {
  createMyth,
  mythFirstLegendary,
  mythPeakRecord,
  mythBondFormed,
  mythStreakMilestone,
  mythLegendaryWitness,
  mythUnanimousPeak,
  getMyths,
  getRecentMyths,
  getMythologyStats,
  registerUserName,
  onMythCreated,
  type MythRecord,
  type MythType,
} from '@/lib/engines/runtime/MythologyEngine';
import {
  seedRoomRhythm,
  getRhythmSnapshot,
  getAvatarTransform,
  onDropSync,
  setAvatarStyle,
  type RhythmStyle,
} from '@/lib/engines/runtime/CrowdRhythmEngine';
import {
  computeRoomPerception,
  getRoomTierSummary,
  markAvatarActive,
  markAvatarLegendary as markPerceptionLegendary,
  promoteToFeatured,
  type AvatarInput,
} from '@/lib/engines/runtime/PerceptionPriorityEngine';

// ── Seed data ─────────────────────────────────────────────────────────────────

const USERS: AvatarInput[] = [
  { avatarId: 'u-atlas',  role: 'performer', energy: 0.9, row: 0, col: 2, isOnStage: true },
  { avatarId: 'u-nova',   role: 'fan',       energy: 0.8, row: 1, col: 1 },
  { avatarId: 'u-cipher', role: 'artist',    energy: 0.75, row: 1, col: 3 },
  { avatarId: 'u-lyra',   role: 'fan',       energy: 0.6, row: 2, col: 0 },
  { avatarId: 'u-storm',  role: 'vip',       energy: 0.85, row: 0, col: 4 },
  { avatarId: 'u-echo',   role: 'sponsor',   energy: 0.5, row: 2, col: 4 },
  { avatarId: 'u-sol',    role: 'fan',       energy: 0.4, row: 3, col: 1 },
  { avatarId: 'u-relic',  role: 'performer', energy: 0.7, row: 0, col: 0, isOnStage: true },
  { avatarId: 'u-prism',  role: 'fan',       energy: 0.55, row: 3, col: 3 },
  { avatarId: 'u-vanta',  role: 'host',      energy: 0.88, row: 1, col: 2 },
];

const USER_NAMES: Record<string, string> = {
  'u-atlas': 'Atlas', 'u-nova': 'Nova', 'u-cipher': 'Cipher',
  'u-lyra': 'Lyra', 'u-storm': 'Storm', 'u-echo': 'Echo',
  'u-sol': 'Sol', 'u-relic': 'Relic', 'u-prism': 'Prism', 'u-vanta': 'Vanta',
};

const ROOMS = ['room-alpha', 'room-beta', 'room-gamma'];
const MYTH_TYPE_COLORS: Record<MythType, string> = {
  'first-legendary':      '#FFD700',
  'streak-milestone':     '#00FF88',
  'peak-energy-record':   '#FF2DAA',
  'crowd-wave-origin':    '#00FFFF',
  'bond-formation':       '#AA2DFF',
  'donation-surge-titan': '#FF9500',
  'room-founder':         'rgba(255,255,255,0.5)',
  'legendary-witness':    '#FFD700',
  'cultural-export':      '#00FFFF',
  'unanimous-peak':       '#FF2DAA',
};

const MYTH_ICONS: Record<MythType, string> = {
  'first-legendary':      '⚡',
  'streak-milestone':     '🔥',
  'peak-energy-record':   '📈',
  'crowd-wave-origin':    '🌊',
  'bond-formation':       '🔗',
  'donation-surge-titan': '💛',
  'room-founder':         '🏛️',
  'legendary-witness':    '👁',
  'cultural-export':      '🌐',
  'unanimous-peak':       '🎯',
};

const RHYTHM_STYLES: RhythmStyle[] = ['headbob', 'sway', 'shoulder-roll', 'full-dance', 'clap', 'breathing'];

// Register names once
for (const [id, name] of Object.entries(USER_NAMES)) registerUserName(id, name);

const CONTEXT = { observerUserId: 'u-nova', roomId: 'room-alpha', observerRow: 1, observerCol: 1 };

// ── Component ─────────────────────────────────────────────────────────────────

export default function MythologyPage() {
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [expandedMythId, setExpandedMythId] = useState<string | null>(null);
  const [rhythmSeeded, setRhythmSeeded] = useState(false);
  const [rhythmSnap, setRhythmSnap] = useState<ReturnType<typeof getRhythmSnapshot> | null>(null);

  const addLog = (msg: string) => setLog((l) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...l.slice(0, 29)]);
  const refresh = () => setTick((t) => t + 1);

  // ── Myth triggers ──────────────────────────────────────────────────────────

  function triggerFirstLegendary() {
    const myth = mythFirstLegendary('u-atlas', 'room-alpha', 10, 'snap-001');
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
    else addLog('First-legendary already recorded for this room');
  }

  function triggerPeakRecord() {
    const myth = mythPeakRecord('u-atlas', 'room-alpha', 0.97, 4.2, 10, 'snap-002');
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
  }

  function triggerBondFormation() {
    const myth = mythBondFormed('u-nova', 'u-atlas', 'room-alpha', 7);
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
    else addLog('Bond myth already recorded for this pair');
  }

  function triggerStreak() {
    const myth = mythStreakMilestone('u-storm', 'room-beta', 10);
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
  }

  function triggerWitnessMyth() {
    const myth = mythLegendaryWitness('u-nova', 'room-alpha', 15);
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
    else addLog('Witness count must be multiple of 5');
  }

  function triggerUnanimousPeak() {
    const myth = mythUnanimousPeak('room-gamma', 10, 3.1, 'snap-003');
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
  }

  function triggerCustomMyth() {
    const myth = createMyth({
      type: 'crowd-wave-origin',
      actorId: 'u-vanta',
      roomId: 'room-beta',
      witnessCount: 8,
      metadata: { durationMs: 1440 },
    });
    if (myth) { addLog(`MYTH: ${myth.headline}`); refresh(); }
  }

  // ── Rhythm controls ────────────────────────────────────────────────────────

  function seedRhythm() {
    const ids = USERS.map((u) => u.avatarId);
    seedRoomRhythm(ids, 128);
    setRhythmSeeded(true);
    setRhythmSnap(getRhythmSnapshot(ids));
    addLog('Rhythm engine seeded — 10 avatars @ 128 BPM');
    refresh();
  }

  function handleDropSync() {
    onDropSync();
    const ids = USERS.map((u) => u.avatarId);
    setRhythmSnap(getRhythmSnapshot(ids));
    addLog('DROP SYNC — all avatars re-synced to canonical beat');
    refresh();
  }

  function handleSetStyle(id: string, style: RhythmStyle) {
    setAvatarStyle(id, style);
    addLog(`${USER_NAMES[id]} → ${style}`);
    refresh();
  }

  // ── Perception controls ────────────────────────────────────────────────────

  function handlePromote(avatarId: string) {
    promoteToFeatured(avatarId, 10_000);
    addLog(`${USER_NAMES[avatarId]} promoted to FEATURED (10s)`);
    refresh();
  }

  function handleMarkActive(avatarId: string) {
    markAvatarActive(avatarId);
    markPerceptionLegendary(avatarId);
    addLog(`${USER_NAMES[avatarId]} marked active + legendary`);
    refresh();
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const myths = useMemo(() => getRecentMyths(20), [tick]);
  const mythStats = useMemo(() => getMythologyStats(), [tick]);
  const perceptionScores = useMemo(() => computeRoomPerception(USERS, CONTEXT), [tick]);
  const tierSummary = useMemo(() => getRoomTierSummary(USERS, CONTEXT), [tick]);

  const tierColors: Record<string, string> = {
    featured: '#FFD700', prominent: '#FF2DAA', standard: '#00FFFF',
    background: 'rgba(255,255,255,0.3)', ambient: 'rgba(255,255,255,0.15)',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0412', color: '#fff', fontFamily: 'monospace', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>
          TMI Admin — Cultural Memory
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '0.04em', color: '#FFD700' }}>
          Mythology Engine
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', maxWidth: 680 }}>
          Platform folklore, rhythm sync, and perception priority. The platform writes its own history.
          When Atlas causes the first 100% spike — the system records it permanently.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 20 }}>
        {/* Left: Mythology timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,215,0,0.5)', textTransform: 'uppercase', marginBottom: 12 }}>
              Mythology Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[
                { label: 'Total Myths', value: mythStats.totalMyths, color: '#FFD700' },
                { label: 'Avg Significance', value: mythStats.avgSignificance.toFixed(2), color: '#FF2DAA' },
                { label: 'Types', value: Object.keys(mythStats.byType).length, color: '#00FFFF' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {mythStats.mostSignificant && (
              <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 8, color: 'rgba(255,215,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Most Significant</div>
                <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 700 }}>{mythStats.mostSignificant.headline}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                  significance: {mythStats.mostSignificant.significance.toFixed(2)} · {mythStats.mostSignificant.witnesses} witnesses
                </div>
              </div>
            )}
          </div>

          {/* Myth triggers */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Trigger Myths
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: '⚡ First Legendary — Atlas', fn: triggerFirstLegendary, color: '#FFD700' },
                { label: '📈 Peak Energy Record — 97%', fn: triggerPeakRecord, color: '#FF2DAA' },
                { label: '🔗 Bond Formation — Nova + Atlas', fn: triggerBondFormation, color: '#AA2DFF' },
                { label: '🔥 Streak Milestone — Storm (10 nights)', fn: triggerStreak, color: '#00FF88' },
                { label: '👁 Legendary Witness — Nova (15×)', fn: triggerWitnessMyth, color: '#FFD700' },
                { label: '🎯 Unanimous Peak — Room Gamma', fn: triggerUnanimousPeak, color: '#FF2DAA' },
                { label: '🌊 Crowd Wave Origin — Vanta', fn: triggerCustomMyth, color: '#00FFFF' },
              ].map(({ label, fn, color }) => (
                <button key={label} onClick={fn} style={{
                  padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${color}44`, borderRadius: 6,
                  color, fontSize: 9, fontWeight: 700, textAlign: 'left',
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, maxHeight: 160, overflowY: 'auto' }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 6 }}>Log</div>
            {log.length === 0
              ? <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>No activity yet</div>
              : log.map((l, i) => <div key={i} style={{ fontSize: 8, color: i === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{l}</div>)
            }
          </div>
        </div>

        {/* Center: Mythology timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>
            World Memory Timeline
          </div>
          {myths.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 10, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              No myths yet. Trigger events on the left.
            </div>
          ) : (
            myths.map((myth) => {
              const color = MYTH_TYPE_COLORS[myth.type] ?? '#fff';
              const isExpanded = expandedMythId === myth.id;
              return (
                <div
                  key={myth.id}
                  onClick={() => setExpandedMythId(isExpanded ? null : myth.id)}
                  style={{
                    background: isExpanded ? `${color}12` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isExpanded ? `${color}55` : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 8, padding: 12, cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{MYTH_ICONS[myth.type]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color, lineHeight: 1.4, marginBottom: 4 }}>
                        {myth.headline}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
                        <span>{myth.type.replace(/-/g, ' ')}</span>
                        <span>{myth.witnesses} witnesses</span>
                        <span>sig: {myth.significance.toFixed(2)}</span>
                        <span style={{ marginLeft: 'auto' }}>{new Date(myth.createdAt).toLocaleTimeString()}</span>
                      </div>
                      {/* Significance bar */}
                      <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${myth.significance * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${color}33`, fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                      {myth.lore}
                      {myth.snapshotId && (
                        <div style={{ marginTop: 6, fontSize: 8, color: color, opacity: 0.7 }}>Snapshot: {myth.snapshotId}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Rhythm + Perception */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rhythm Engine */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Crowd Rhythm Engine
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={seedRhythm} style={{
                flex: 1, padding: '8px 0', background: rhythmSeeded ? 'rgba(0,255,136,0.12)' : '#00FF88',
                border: `1px solid #00FF88`, borderRadius: 5, color: rhythmSeeded ? '#00FF88' : '#0a0412',
                fontSize: 9, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.1em',
              }}>
                {rhythmSeeded ? '↻ RE-SEED' : '⚡ SEED RHYTHM'}
              </button>
              <button onClick={handleDropSync} style={{
                flex: 1, padding: '8px 0', background: 'rgba(255,45,170,0.12)',
                border: '1px solid rgba(255,45,170,0.4)', borderRadius: 5, color: '#FF2DAA',
                fontSize: 9, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.1em',
              }}>
                DROP SYNC
              </button>
            </div>

            {rhythmSnap && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                {[
                  { label: 'BPM', value: rhythmSnap.bpm, color: '#00FF88' },
                  { label: 'Phase', value: `${Math.round(rhythmSnap.beatPhase * 100)}%`, color: '#00FFFF' },
                  { label: 'Synced', value: rhythmSnap.syncedAvatars, color: '#00FF88' },
                  { label: 'Drifted', value: rhythmSnap.driftedAvatars, color: '#FF9500' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {rhythmSeeded && (
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Avatar Styles</div>
                {USERS.slice(0, 5).map((u) => (
                  <div key={u.avatarId} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 700, width: 44 }}>{USER_NAMES[u.avatarId]}</span>
                    <select
                      onChange={(e) => handleSetStyle(u.avatarId, e.target.value as RhythmStyle)}
                      defaultValue="headbob"
                      style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#fff', padding: '3px 6px', fontSize: 8, fontFamily: 'monospace' }}
                    >
                      {RHYTHM_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {/* Mini sway indicator */}
                    <div style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{
                        width: 4, height: 8, borderRadius: 2, background: '#00FF88',
                        transform: `translateY(${getAvatarTransform(u.avatarId).translateY * 0.5}px)`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Perception Priority */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Perception Priority
            </div>

            {/* Tier summary */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {Object.entries(tierSummary.tierBreakdown).map(([tier, count]) => (
                <div key={tier} style={{ padding: '4px 8px', borderRadius: 4, background: `${tierColors[tier] ?? '#fff'}22`, border: `1px solid ${tierColors[tier] ?? '#fff'}44` }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: tierColors[tier] ?? '#fff' }}>{count}</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginLeft: 4, textTransform: 'capitalize' }}>{tier}</span>
                </div>
              ))}
              <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#AA2DFF' }}>{Math.round(tierSummary.estimatedRenderBudget * 100)}%</span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>render budget</span>
              </div>
            </div>

            {/* Avatar perception list */}
            {perceptionScores.map((s) => {
              const color = tierColors[s.tier] ?? '#fff';
              const name = USER_NAMES[s.avatarId] ?? s.avatarId;
              return (
                <div key={s.avatarId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', width: 44 }}>{name}</span>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${s.score}%`, height: '100%', background: color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 8, color, fontWeight: 900, width: 28, textAlign: 'right' }}>{Math.round(s.score)}</span>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', width: 52, textTransform: 'capitalize' }}>{s.tier}</span>
                  <button onClick={() => handlePromote(s.avatarId)} style={{
                    padding: '2px 6px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)',
                    borderRadius: 3, color: '#FFD700', fontSize: 7, cursor: 'pointer',
                  }}>↑</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
