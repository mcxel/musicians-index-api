/**
 * MythologyEngine
 * The platform writes its own history.
 *
 * Generates human-readable folklore from legendary events, user milestones,
 * and crowd behavior patterns. When Atlas causes the first 100% energy spike,
 * or Nova and Cipher start the legendary wave, the system records it as myth —
 * not just telemetry.
 *
 * Mythology is what turns users into communities.
 */

import { universalNow } from './UniversalClockRuntime';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MythType =
  | 'first-legendary'        // first time a trigger type fires in history
  | 'streak-milestone'       // user attended N consecutive legendary nights
  | 'peak-energy-record'     // new platform-wide energy record set
  | 'crowd-wave-origin'      // avatar who originated a crowd wave that consumed >80% of room
  | 'bond-formation'         // two users hit "bonded" phase for the first time
  | 'donation-surge-titan'   // user who triggered a donation surge single-handedly
  | 'room-founder'           // first user to ever attend a room
  | 'legendary-witness'      // user who witnessed N legendary moments
  | 'cultural-export'        // a legendary artifact that spread to other rooms
  | 'unanimous-peak';        // entire room reached max energy simultaneously

export interface MythRecord {
  id: string;
  type: MythType;
  headline: string;         // short myth statement: "Atlas set the first 100% record"
  lore: string;             // longer narrative for the timeline/magazine
  involvedUserIds: string[];
  roomId: string;
  snapshotId: string | null;
  createdAt: number;
  isVerified: boolean;      // platform-confirmed vs crowd-sourced
  witnesses: number;        // how many avatars were present
  significance: number;     // 0–1 cultural weight
}

export interface MythogenesisEvent {
  type: MythType;
  actorId: string;          // primary user credited
  supportingActorIds?: string[];
  roomId: string;
  snapshotId?: string;
  witnessCount?: number;
  metadata: Record<string, unknown>;
}

// ── Lore templates ────────────────────────────────────────────────────────────

const LORE_TEMPLATES: Record<MythType, (ctx: TemplateContext) => { headline: string; lore: string }> = {
  'first-legendary': (ctx) => ({
    headline: `${ctx.actor} ignited the first Legendary Moment in TMI history.`,
    lore: `On ${ctx.date}, ${ctx.actor} was performing in ${ctx.room} when the crowd energy crossed the threshold and the platform declared its very first Legendary Moment. ${ctx.witnesses} witnesses were present. The moment was archived automatically — before anyone knew what was happening.`,
  }),
  'streak-milestone': (ctx) => ({
    headline: `${ctx.actor} has attended ${ctx.meta.streak} consecutive legendary nights.`,
    lore: `${ctx.actor} has been present for ${ctx.meta.streak} legendary moments in a row — never missing one. The crowd has started to notice. Their presence in a room has begun to correlate with energy spikes. Whether they cause it or attract it remains unknown.`,
  }),
  'peak-energy-record': (ctx) => ({
    headline: `${ctx.room} shattered the energy record — ${ctx.meta.energy}% sustained.`,
    lore: `${ctx.actor} was on stage in ${ctx.room} when the crowd reached a platform-record ${ctx.meta.energy}% energy, sustained for ${ctx.meta.sustainSec}s. ${ctx.witnesses} avatars were present. The recording exists in the Memory Timeline. It has not been broken yet.`,
  }),
  'crowd-wave-origin': (ctx) => ({
    headline: `${ctx.actor} started a wave that swept the entire room.`,
    lore: `${ctx.actor} triggered a crowd wave from their position that propagated through ${ctx.witnesses} avatars in ${ctx.room}. The wave reached the back wall in ${ctx.meta.durationMs}ms. Those who were there remember it as the moment the room became one.`,
  }),
  'bond-formation': (ctx) => ({
    headline: `${ctx.actor} and ${ctx.meta.partner} became bonded — the platform confirmed it.`,
    lore: `After ${ctx.meta.sharedRooms} shared rooms and a legendary moment together, the RelationshipMomentumEngine classified ${ctx.actor} and ${ctx.meta.partner} as bonded. The social graph registered a weighted edge that has not broken since. They consistently appear in adjacent seats.`,
  }),
  'donation-surge-titan': (ctx) => ({
    headline: `${ctx.actor} triggered a donation surge that locked the room.`,
    lore: `${ctx.actor} sent ${ctx.meta.donations} tips in ${ctx.meta.windowSec}s in ${ctx.room}, triggering a Donation Surge declaration. The crowd energy jumped ${ctx.meta.energyDelta}% points in response. The room has never forgotten.`,
  }),
  'room-founder': (ctx) => ({
    headline: `${ctx.actor} was the first person to ever step into ${ctx.room}.`,
    lore: `When ${ctx.room} opened for the first time, ${ctx.actor} was the first avatar to enter. Their footstep — metaphorical, but tracked — is the founding moment of that room's cultural history. Every legendary event since has been measured from that origin.`,
  }),
  'legendary-witness': (ctx) => ({
    headline: `${ctx.actor} has witnessed ${ctx.meta.legendaryCount} legendary moments.`,
    lore: `${ctx.actor} has been present at ${ctx.meta.legendaryCount} platform-declared legendary moments. They appear consistently in the front rows of high-energy rooms. The crowd recognizes their energy signature even before the system names them. Their presence is now a leading indicator of legendary nights.`,
  }),
  'cultural-export': (ctx) => ({
    headline: `A legendary artifact from ${ctx.room} has spread to other rooms.`,
    lore: `The legendary artifact generated from ${ctx.room}'s peak moment — created automatically from a crowd energy spike — was shared across multiple rooms. It has been viewed ${ctx.meta.views} times. The myth has escaped its origin.`,
  }),
  'unanimous-peak': (ctx) => ({
    headline: `${ctx.room} hit unanimous peak — every avatar at max energy simultaneously.`,
    lore: `For ${ctx.meta.durationSec}s, every avatar in ${ctx.room} was at maximum crowd energy at the same time. The LegendaryMomentDetector fired every trigger simultaneously. ${ctx.witnesses} witnesses. The DistributedStateCheckpoint captured it. The event exists permanently in the World Memory Timeline.`,
  }),
};

interface TemplateContext {
  actor: string;
  room: string;
  date: string;
  witnesses: number;
  meta: Record<string, unknown>;
}

// ── Name resolution ───────────────────────────────────────────────────────────

const userNames = new Map<string, string>();

export function registerUserName(userId: string, name: string): void {
  userNames.set(userId, name);
}

function resolveName(userId: string): string {
  return userNames.get(userId) ?? userId.replace('u-', '').replace(/-/g, ' ');
}

function roomLabel(roomId: string): string {
  return roomId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Storage ───────────────────────────────────────────────────────────────────

const myths: MythRecord[] = [];
const seenFirstEvents = new Set<string>();   // prevent duplicate "first-X" myths
const MAX_MYTHS = 500;
const mythHandlers = new Set<(myth: MythRecord) => void>();

function mythId(): string {
  return `myth-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Trigger myth creation from a platform event.
 * Call from LegendaryMomentDetector, EmotionalMemoryEngine, etc.
 */
export function createMyth(event: MythogenesisEvent): MythRecord | null {
  // De-duplicate "first-X" events
  const dedupeKey = `${event.type}:${event.actorId}`;
  if (event.type === 'first-legendary' || event.type === 'room-founder') {
    const globalKey = `${event.type}:${event.roomId}`;
    if (seenFirstEvents.has(globalKey)) return null;
    seenFirstEvents.add(globalKey);
  }
  if (event.type === 'bond-formation') {
    const [a, b] = [event.actorId, event.metadata.partnerId as string].sort();
    const bondKey = `bond-formation:${a}:${b}`;
    if (seenFirstEvents.has(bondKey)) return null;
    seenFirstEvents.add(bondKey);
  }
  void dedupeKey;

  const actorName = resolveName(event.actorId);
  const room = roomLabel(event.roomId);
  const date = new Date(universalNow()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const witnesses = event.witnessCount ?? 0;

  const ctx: TemplateContext = {
    actor: actorName,
    room,
    date,
    witnesses,
    meta: event.metadata,
  };

  const template = LORE_TEMPLATES[event.type];
  const { headline, lore } = template(ctx);

  const significance = computeSignificance(event, witnesses);

  const myth: MythRecord = {
    id: mythId(),
    type: event.type,
    headline,
    lore,
    involvedUserIds: [event.actorId, ...(event.supportingActorIds ?? [])],
    roomId: event.roomId,
    snapshotId: event.snapshotId ?? null,
    createdAt: universalNow(),
    isVerified: true,
    witnesses,
    significance,
  };

  myths.push(myth);
  if (myths.length > MAX_MYTHS) myths.shift();

  for (const h of mythHandlers) {
    try { h(myth); } catch { /* ignore */ }
  }

  return myth;
}

function computeSignificance(event: MythogenesisEvent, witnesses: number): number {
  const TYPE_WEIGHT: Record<MythType, number> = {
    'unanimous-peak':          1.0,
    'first-legendary':         0.95,
    'peak-energy-record':      0.90,
    'legendary-witness':       0.75,
    'crowd-wave-origin':       0.65,
    'donation-surge-titan':    0.70,
    'cultural-export':         0.80,
    'bond-formation':          0.60,
    'streak-milestone':        0.55,
    'room-founder':            0.50,
  };
  const baseWeight = TYPE_WEIGHT[event.type] ?? 0.5;
  const witnessBonus = Math.min(0.2, witnesses / 100 * 0.2);  // up to +0.2 for large crowds
  return Math.min(1, baseWeight + witnessBonus);
}

// ── Milestone shortcuts ───────────────────────────────────────────────────────

export function mythFirstLegendary(actorId: string, roomId: string, witnessCount: number, snapshotId?: string): MythRecord | null {
  return createMyth({ type: 'first-legendary', actorId, roomId, witnessCount, snapshotId, metadata: {} });
}

export function mythStreakMilestone(actorId: string, roomId: string, streak: number): MythRecord | null {
  return createMyth({ type: 'streak-milestone', actorId, roomId, metadata: { streak } });
}

export function mythPeakRecord(actorId: string, roomId: string, energy: number, sustainSec: number, witnessCount: number, snapshotId?: string): MythRecord | null {
  return createMyth({ type: 'peak-energy-record', actorId, roomId, witnessCount, snapshotId, metadata: { energy: Math.round(energy * 100), sustainSec } });
}

export function mythBondFormed(userA: string, userB: string, roomId: string, sharedRooms: number): MythRecord | null {
  return createMyth({ type: 'bond-formation', actorId: userA, roomId, metadata: { partner: resolveName(userB), partnerId: userB, sharedRooms } });
}

export function mythLegendaryWitness(actorId: string, roomId: string, count: number): MythRecord | null {
  if (count % 5 !== 0) return null;  // only record at milestone intervals: 5, 10, 15...
  return createMyth({ type: 'legendary-witness', actorId, roomId, metadata: { legendaryCount: count } });
}

export function mythUnanimousPeak(roomId: string, witnessCount: number, durationSec: number, snapshotId?: string): MythRecord | null {
  return createMyth({ type: 'unanimous-peak', actorId: 'platform', roomId, witnessCount, snapshotId, metadata: { durationSec } });
}

// ── Query API ─────────────────────────────────────────────────────────────────

export function getMyths(opts?: { limit?: number; type?: MythType; minSignificance?: number; roomId?: string }): MythRecord[] {
  let result = [...myths];
  if (opts?.type) result = result.filter((m) => m.type === opts.type);
  if (opts?.roomId) result = result.filter((m) => m.roomId === opts.roomId);
  if (opts?.minSignificance !== undefined) result = result.filter((m) => m.significance >= opts.minSignificance!);
  return result
    .sort((a, b) => b.significance - a.significance || b.createdAt - a.createdAt)
    .slice(0, opts?.limit ?? 20);
}

export function getRecentMyths(limit = 10): MythRecord[] {
  return myths.slice(-limit).reverse();
}

export function getMythsByUser(userId: string, limit = 10): MythRecord[] {
  return myths
    .filter((m) => m.involvedUserIds.includes(userId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function getMythologyStats(): {
  totalMyths: number;
  byType: Partial<Record<MythType, number>>;
  avgSignificance: number;
  mostSignificant: MythRecord | null;
} {
  const byType: Partial<Record<MythType, number>> = {};
  let sigSum = 0;
  let mostSig: MythRecord | null = null;

  for (const m of myths) {
    byType[m.type] = (byType[m.type] ?? 0) + 1;
    sigSum += m.significance;
    if (!mostSig || m.significance > mostSig.significance) mostSig = m;
  }

  return {
    totalMyths: myths.length,
    byType,
    avgSignificance: myths.length > 0 ? Math.round((sigSum / myths.length) * 100) / 100 : 0,
    mostSignificant: mostSig,
  };
}

export function onMythCreated(handler: (myth: MythRecord) => void): () => void {
  mythHandlers.add(handler);
  return () => mythHandlers.delete(handler);
}
