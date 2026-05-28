'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  recordInteraction,
  recordCopresence,
  recordSharedLegendary,
  getTopBonds,
  getMutualBonds,
  getUserProfile,
  getRelationshipStats,
  getInteractionLog,
  suggestSeatingClusters,
  type InteractionType,
  type EmotionalStateLabel,
  type BondRecord,
  type InteractionEvent,
} from '@/lib/engines/runtime/EmotionalMemoryEngine';

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_USERS = [
  { id: 'u-atlas',   name: 'Atlas',   role: 'performer' },
  { id: 'u-nova',    name: 'Nova',    role: 'fan' },
  { id: 'u-cipher',  name: 'Cipher',  role: 'artist' },
  { id: 'u-lyra',    name: 'Lyra',    role: 'fan' },
  { id: 'u-storm',   name: 'Storm',   role: 'vip' },
  { id: 'u-echo',    name: 'Echo',    role: 'sponsor' },
  { id: 'u-sol',     name: 'Sol',     role: 'fan' },
  { id: 'u-relic',   name: 'Relic',   role: 'performer' },
  { id: 'u-prism',   name: 'Prism',   role: 'fan' },
  { id: 'u-vanta',   name: 'Vanta',   role: 'host' },
];

const ROOMS = ['room-alpha', 'room-beta', 'room-gamma'];

const INTERACTION_COLORS: Record<InteractionType, string> = {
  'co-presence':        'rgba(255,255,255,0.25)',
  'tip':                '#FFD700',
  'reaction':           '#00FFFF',
  'shared-legendary':   '#FF2DAA',
  'consecutive-rooms':  '#00FF88',
  'direct-emote':       '#AA2DFF',
  'follow':             '#FF9500',
  'vote-same':          '#00CCFF',
  'recurring-neighbor': '#FF6B6B',
};

const STATE_COLORS: Record<EmotionalStateLabel, string> = {
  social:     '#00FFFF',
  loyal:      '#FF2DAA',
  observer:   '#AA2DFF',
  newcomer:   'rgba(255,255,255,0.3)',
  legendary:  '#FFD700',
  generous:   '#00FF88',
  performer:  '#FF9500',
};

const STATE_ICONS: Record<EmotionalStateLabel, string> = {
  social:    '🌐',
  loyal:     '🔗',
  observer:  '👁',
  newcomer:  '✦',
  legendary: '⚡',
  generous:  '💛',
  performer: '🎤',
};

function strengthBar(strength: number, color: string) {
  return (
    <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.round(strength * 100)}%`,
        height: '100%',
        background: color,
        borderRadius: 3,
        transition: 'width 0.4s',
      }} />
    </div>
  );
}

// ── Seeding logic (runs once) ─────────────────────────────────────────────────

function seedRelationships(log: (msg: string) => void) {
  const ids = SEED_USERS.map((u) => u.id);
  const now = Date.now();

  // Co-presence across rooms
  for (const roomId of ROOMS) {
    recordCopresence(ids, roomId);
    log(`Co-presence seeded in ${roomId} (${ids.length} users)`);
  }

  // Tip events
  recordInteraction({ type: 'tip', fromUserId: 'u-nova', toUserId: 'u-atlas', roomId: 'room-alpha', timestamp: now, metadata: { amount: 5 } });
  recordInteraction({ type: 'tip', fromUserId: 'u-lyra', toUserId: 'u-atlas', roomId: 'room-alpha', timestamp: now, metadata: { amount: 10 } });
  recordInteraction({ type: 'tip', fromUserId: 'u-storm', toUserId: 'u-relic', roomId: 'room-beta', timestamp: now, metadata: { amount: 20 } });
  recordInteraction({ type: 'tip', fromUserId: 'u-echo', toUserId: 'u-cipher', roomId: 'room-gamma', timestamp: now, metadata: { amount: 50 } });
  log('Tips recorded: Nova→Atlas, Lyra→Atlas, Storm→Relic, Echo→Cipher');

  // Follows
  recordInteraction({ type: 'follow', fromUserId: 'u-nova', toUserId: 'u-cipher', roomId: 'room-gamma', timestamp: now, metadata: {} });
  recordInteraction({ type: 'follow', fromUserId: 'u-sol', toUserId: 'u-atlas', roomId: 'room-alpha', timestamp: now, metadata: {} });
  recordInteraction({ type: 'follow', fromUserId: 'u-prism', toUserId: 'u-relic', roomId: 'room-beta', timestamp: now, metadata: {} });
  log('Follows recorded: Nova→Cipher, Sol→Atlas, Prism→Relic');

  // Shared legendary
  recordSharedLegendary(['u-atlas', 'u-nova', 'u-storm', 'u-vanta'], 'snap-legendary-001', 'room-alpha');
  recordSharedLegendary(['u-relic', 'u-cipher', 'u-echo'], 'snap-legendary-002', 'room-beta');
  log('Shared legendaries recorded: 4 users in alpha, 3 users in beta');

  // Direct emotes
  recordInteraction({ type: 'direct-emote', fromUserId: 'u-nova', toUserId: 'u-atlas', roomId: 'room-alpha', timestamp: now, metadata: { gesture: 'wave' } });
  recordInteraction({ type: 'direct-emote', fromUserId: 'u-storm', toUserId: 'u-cipher', roomId: 'room-gamma', timestamp: now, metadata: { gesture: 'cheer' } });
  log('Direct emotes: Nova→Atlas (wave), Storm→Cipher (cheer)');

  // Consecutive rooms
  recordInteraction({ type: 'consecutive-rooms', fromUserId: 'u-lyra', toUserId: 'u-sol', roomId: 'room-alpha', timestamp: now, metadata: { sessions: 3 } });
  recordInteraction({ type: 'recurring-neighbor', fromUserId: 'u-prism', toUserId: 'u-nova', roomId: 'room-alpha', timestamp: now, metadata: { sessions: 4 } });
  log('Consecutive/neighbor bonds: Lyra↔Sol, Prism↔Nova');
}

// ── Bond graph visualization ──────────────────────────────────────────────────

function BondGraph({ selectedUser, onSelect }: { selectedUser: string | null; onSelect: (id: string) => void }) {
  const cx = 220, cy = 220, r = 160;
  const users = SEED_USERS;
  const n = users.length;

  const positions = useMemo(() =>
    users.map((_, i) => ({
      x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
      y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
    })), [n]);

  const edges = useMemo(() => {
    if (!selectedUser) return [];
    return getTopBonds(selectedUser, 8).map((b) => {
      const toIdx = users.findIndex((u) => u.id === b.toUserId);
      const fromIdx = users.findIndex((u) => u.id === b.fromUserId);
      return { bond: b, fromPos: positions[fromIdx], toPos: positions[toIdx] };
    }).filter((e) => e.fromPos && e.toPos);
  }, [selectedUser, positions, users]);

  return (
    <svg width={440} height={440} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="glow-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#AA2DFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#AA2DFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 20} fill="url(#glow-center)" />

      {/* Edges */}
      {edges.map(({ bond, fromPos, toPos }, i) => {
        if (!fromPos || !toPos) return null;
        const color = INTERACTION_COLORS[bond.dominantType] ?? '#fff';
        return (
          <line
            key={i}
            x1={fromPos.x} y1={fromPos.y}
            x2={toPos.x} y2={toPos.y}
            stroke={color}
            strokeWidth={Math.max(0.5, bond.strength * 4)}
            strokeOpacity={0.4 + bond.strength * 0.5}
            strokeDasharray={bond.dominantType === 'co-presence' ? '4 4' : undefined}
          />
        );
      })}

      {/* Nodes */}
      {users.map((user, i) => {
        const pos = positions[i]!;
        const profile = getUserProfile(user.id);
        const state = profile.emotionalState.label;
        const color = STATE_COLORS[state];
        const isSelected = selectedUser === user.id;
        const isConnected = edges.some((e) => e.bond.toUserId === user.id);
        return (
          <g key={user.id} onClick={() => onSelect(user.id)} style={{ cursor: 'pointer' }}>
            <circle
              cx={pos.x} cy={pos.y} r={isSelected ? 18 : 13}
              fill={isSelected ? color : 'rgba(20,10,40,0.9)'}
              stroke={color}
              strokeWidth={isSelected ? 2.5 : isConnected ? 1.5 : 1}
              strokeOpacity={isConnected || isSelected ? 1 : 0.4}
            />
            {isSelected && (
              <circle cx={pos.x} cy={pos.y} r={24} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.3} />
            )}
            <text
              x={pos.x} y={pos.y + 4}
              textAnchor="middle"
              fontSize={isSelected ? 10 : 8}
              fontWeight={900}
              fill={isSelected ? '#0a0412' : color}
              fontFamily="monospace"
            >
              {user.name.slice(0, 5)}
            </text>
            <text
              x={pos.x} y={pos.y + (pos.y < cy ? -18 : 26)}
              textAnchor="middle"
              fontSize={7}
              fill="rgba(255,255,255,0.35)"
              fontFamily="monospace"
            >
              {STATE_ICONS[state]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SocialGraphPage() {
  const [seeded, setSeeded] = useState(false);
  const [seedLog, setSeedLog] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  function addLog(msg: string) {
    setSeedLog((prev) => [...prev, msg]);
  }

  function handleSeed() {
    setSeedLog([]);
    seedRelationships(addLog);
    setSeeded(true);
    setTick((t) => t + 1);
  }

  const stats = useMemo(() => getRelationshipStats(), [tick]);
  const interactionLog = useMemo(() => getInteractionLog(15), [tick]);

  const selectedProfile = useMemo(() =>
    selectedUser ? getUserProfile(selectedUser) : null,
    [selectedUser, tick]);

  const selectedTopBonds = useMemo(() =>
    selectedUser ? getTopBonds(selectedUser, 6) : [],
    [selectedUser, tick]);

  const seatingMap = useMemo(() => {
    const ids = SEED_USERS.map((u) => u.id);
    return suggestSeatingClusters(ids, 5);
  }, [tick]);

  const userName = (id: string) => SEED_USERS.find((u) => u.id === id)?.name ?? id;

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0412', color: '#fff',
      fontFamily: 'monospace', padding: '32px 24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>
          TMI Admin — Emotional Intelligence
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '0.05em', color: '#AA2DFF' }}>
          Social Graph
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', maxWidth: 600 }}>
          Bond strength graph. Who danced near whom. Who tipped. Who shared legendary moments.
          The crowd's invisible skeleton — the social weight that shapes future seating and behavior.
        </p>
      </div>

      {/* Seed + Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <button
          onClick={handleSeed}
          style={{
            padding: '10px 22px', background: seeded ? 'rgba(170,45,255,0.15)' : '#AA2DFF',
            border: `1px solid #AA2DFF`, borderRadius: 6, color: '#fff',
            fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase',
          }}
        >
          {seeded ? '↻ RE-SEED RELATIONSHIPS' : '⚡ SEED RELATIONSHIPS'}
        </button>

        {/* Stats chips */}
        {[
          { label: 'Total Bonds', value: stats.totalBonds, color: '#AA2DFF' },
          { label: 'Strong (>50%)', value: stats.strongBonds, color: '#FF2DAA' },
          { label: 'Profiles', value: stats.totalProfiles, color: '#00FFFF' },
          { label: 'Interactions', value: stats.totalInteractions, color: '#00FF88' },
          { label: 'Legendary Pairs', value: stats.sharedLegendaryPairs, color: '#FFD700' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
            borderRadius: 6, padding: '8px 14px',
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 24 }}>
        {/* Left: Bond graph */}
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Relationship Network — Click a node
            </div>
            <BondGraph selectedUser={selectedUser} onSelect={setSelectedUser} />

            {/* Legend */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {(Object.entries(STATE_COLORS) as [EmotionalStateLabel, string][]).map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional State Breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 16, marginTop: 16,
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Emotional State Breakdown
            </div>
            {stats.totalProfiles === 0 ? (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>No profiles yet — seed relationships</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(Object.entries(stats.emotionalStateBreakdown) as [EmotionalStateLabel, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12 }}>{STATE_ICONS[label]}</span>
                      <span style={{ fontSize: 9, color: STATE_COLORS[label], fontWeight: 700, width: 72, textTransform: 'capitalize' }}>{label}</span>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(count / stats.totalProfiles) * 100}%`,
                          height: '100%', background: STATE_COLORS[label], borderRadius: 3,
                        }} />
                      </div>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', width: 20, textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selected user detail */}
          {selectedUser && selectedProfile ? (
            <div style={{
              background: 'rgba(170,45,255,0.08)', border: '1px solid rgba(170,45,255,0.3)',
              borderRadius: 10, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: STATE_COLORS[selectedProfile.emotionalState.label],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {STATE_ICONS[selectedProfile.emotionalState.label]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{userName(selectedUser)}</div>
                  <div style={{ fontSize: 9, color: STATE_COLORS[selectedProfile.emotionalState.label], textTransform: 'capitalize', marginTop: 2 }}>
                    {selectedProfile.emotionalState.label} · {Math.round(selectedProfile.emotionalState.confidence * 100)}% confidence
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
                  {[
                    { label: 'Tips Given', value: selectedProfile.tipsGiven, color: '#FFD700' },
                    { label: 'Tips Recv', value: selectedProfile.tipsReceived, color: '#00FF88' },
                    { label: 'Reactions', value: selectedProfile.reactionsGiven, color: '#00FFFF' },
                    { label: 'Legendaries', value: selectedProfile.legendaryMomentsWitnessed, color: '#FF2DAA' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 10 }}>
                Top Bonds
              </div>
              {selectedTopBonds.length === 0 ? (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>No bonds yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedTopBonds.map((bond: BondRecord) => {
                    const color = INTERACTION_COLORS[bond.dominantType] ?? '#fff';
                    const { mutualStrength } = getMutualBonds(bond.fromUserId, bond.toUserId);
                    return (
                      <div key={bond.toUserId} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6,
                        cursor: 'pointer',
                      }} onClick={() => setSelectedUser(bond.toUserId)}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', width: 56 }}>{userName(bond.toUserId)}</span>
                        <span style={{ fontSize: 8, color: color, width: 80, textTransform: 'capitalize' }}>{bond.dominantType}</span>
                        {strengthBar(bond.strength, color)}
                        <span style={{ fontSize: 9, fontWeight: 900, color, width: 32, textAlign: 'right' }}>{Math.round(bond.strength * 100)}%</span>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>
                          mutual {Math.round(mutualStrength * 100)}%
                        </span>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
                          {bond.interactionCount}× · {bond.sharedRooms.size} rooms
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: 24, textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>👆</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Click a node in the graph to inspect bond details</div>
            </div>
          )}

          {/* Suggested seating clusters */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Suggested Seating — Bond-Optimized (5 cols)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, maxWidth: 360 }}>
              {Array.from({ length: Math.ceil(SEED_USERS.length / 5) }, (_, row) =>
                Array.from({ length: 5 }, (_, col) => {
                  const userId = [...seatingMap.entries()].find(([, pos]) => pos.row === row && pos.col === col)?.[0];
                  const user = SEED_USERS.find((u) => u.id === userId);
                  const profile = userId ? getUserProfile(userId) : null;
                  const color = profile ? STATE_COLORS[profile.emotionalState.label] : 'rgba(255,255,255,0.1)';
                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{
                        height: 40, borderRadius: 5,
                        background: user ? `${color}22` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${user ? `${color}55` : 'rgba(255,255,255,0.05)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                        cursor: user ? 'pointer' : 'default',
                      }}
                      onClick={() => user && setSelectedUser(user.id)}
                    >
                      {user && (
                        <>
                          <span style={{ fontSize: 8, fontWeight: 900, color, lineHeight: 1 }}>{user.name.slice(0, 5)}</span>
                          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{STATE_ICONS[profile!.emotionalState.label]}</span>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
              ▲ Stage — bonded users placed adjacent · high-density connectors in front rows
            </div>
          </div>

          {/* Interaction log */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Interaction Log (last 15)
            </div>
            {interactionLog.length === 0 ? (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>No interactions yet — seed relationships</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {interactionLog.map((ev: InteractionEvent, i) => {
                  const color = INTERACTION_COLORS[ev.type] ?? '#fff';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ color: '#fff', fontWeight: 700, width: 40 }}>{userName(ev.fromUserId)}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                      <span style={{ color: '#fff', fontWeight: 700, width: 40 }}>{userName(ev.toUserId)}</span>
                      <span style={{ color, flex: 1, textTransform: 'capitalize' }}>{ev.type}</span>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8 }}>{ev.roomId.replace('room-', '')}</span>
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7 }}>w={ev.weight.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seed log */}
          {seedLog.length > 0 && (
            <div style={{
              background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 10, padding: 14,
            }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#00FF88', textTransform: 'uppercase', marginBottom: 8 }}>
                Seed Log
              </div>
              {seedLog.map((line, i) => (
                <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>✓ {line}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
