/**
 * PersistentAvatarStateStore
 * Preserves avatar identity across disconnects, room changes, and failovers.
 * Every avatar remembers their seat, outfit, mood, friend cluster, and gesture
 * so the world feels continuous when they rejoin.
 */

export type AvatarMood = 'neutral' | 'excited' | 'grooving' | 'chilling' | 'focused' | 'hyped' | 'celebrating';
export type AvatarGesture = 'idle' | 'wave' | 'clap' | 'point' | 'dance' | 'cheer' | 'sit' | 'lean';
export type AvatarRole = 'fan' | 'performer' | 'artist' | 'vip' | 'sponsor' | 'host' | 'bot';

export interface OutfitLayer {
  base: string;        // color hex or preset id
  top?: string;        // jacket, shirt layer
  headwear?: string;   // hat, headphones, crown
  accessory?: string;  // mic, drink, phone
  aura?: string;       // glow color hex (VIP/sponsor aura)
}

export interface SeatPosition {
  row: number;           // 0 = front
  col: number;           // 0 = left
  sectionId: string;     // 'floor' | 'vip' | 'balcony' | 'stage-left' etc.
  isStanding: boolean;
}

export interface FriendCluster {
  clusterId: string;
  memberIds: string[];   // userIds
  anchorSeatId: string;  // seat of the cluster center
}

export interface AvatarState {
  userId: string;
  displayName: string;
  role: AvatarRole;
  roomId: string;
  seat: SeatPosition;
  outfit: OutfitLayer;
  mood: AvatarMood;
  gesture: AvatarGesture;
  friendCluster: FriendCluster | null;
  energyLevel: number;   // 0–1, drives animation intensity
  lastSeenAt: number;    // UTC ms
  joinedAt: number;      // UTC ms for this room session
  totalSessionMs: number; // cumulative time in this room
  isOnline: boolean;
}

const store = new Map<string, AvatarState>();
const roomIndex = new Map<string, Set<string>>();  // roomId → Set<userId>
const STALE_THRESHOLD_MS = 10 * 60 * 1000;  // 10 min offline = stale

function indexRoom(userId: string, roomId: string): void {
  if (!roomIndex.has(roomId)) roomIndex.set(roomId, new Set());
  roomIndex.get(roomId)!.add(userId);
}

function deindexRoom(userId: string, roomId: string): void {
  roomIndex.get(roomId)?.delete(userId);
}

export function upsertAvatar(state: AvatarState): void {
  const existing = store.get(state.userId);
  if (existing && existing.roomId !== state.roomId) {
    deindexRoom(state.userId, existing.roomId);
  }
  store.set(state.userId, { ...state, lastSeenAt: Date.now() });
  indexRoom(state.userId, state.roomId);
}

export function markOnline(userId: string): void {
  const s = store.get(userId);
  if (s) store.set(userId, { ...s, isOnline: true, lastSeenAt: Date.now() });
}

export function markOffline(userId: string): void {
  const s = store.get(userId);
  if (!s) return;
  const elapsed = Date.now() - (s.joinedAt ?? Date.now());
  store.set(userId, {
    ...s,
    isOnline: false,
    lastSeenAt: Date.now(),
    totalSessionMs: (s.totalSessionMs ?? 0) + elapsed,
  });
}

export function getAvatarState(userId: string): AvatarState | undefined {
  return store.get(userId);
}

export function getRoomAvatars(roomId: string): AvatarState[] {
  const ids = roomIndex.get(roomId);
  if (!ids) return [];
  const out: AvatarState[] = [];
  for (const id of ids) {
    const s = store.get(id);
    if (s) out.push(s);
  }
  return out;
}

export function getOnlineRoomAvatars(roomId: string): AvatarState[] {
  return getRoomAvatars(roomId).filter((a) => a.isOnline);
}

export function updateMood(userId: string, mood: AvatarMood): void {
  const s = store.get(userId);
  if (s) store.set(userId, { ...s, mood });
}

export function updateGesture(userId: string, gesture: AvatarGesture): void {
  const s = store.get(userId);
  if (s) store.set(userId, { ...s, gesture });
}

export function updateEnergyLevel(userId: string, energy: number): void {
  const s = store.get(userId);
  if (s) store.set(userId, { ...s, energyLevel: Math.max(0, Math.min(1, energy)) });
}

export function updateOutfit(userId: string, outfit: Partial<OutfitLayer>): void {
  const s = store.get(userId);
  if (s) store.set(userId, { ...s, outfit: { ...s.outfit, ...outfit } });
}

export function joinFriendCluster(userId: string, cluster: FriendCluster): void {
  const s = store.get(userId);
  if (s) store.set(userId, { ...s, friendCluster: cluster });
}

export function leaveRoom(userId: string, roomId: string): void {
  markOffline(userId);
  deindexRoom(userId, roomId);
}

export function purgeStaleAvatars(): number {
  const threshold = Date.now() - STALE_THRESHOLD_MS;
  let purged = 0;
  for (const [userId, state] of store) {
    if (!state.isOnline && state.lastSeenAt < threshold) {
      deindexRoom(userId, state.roomId);
      store.delete(userId);
      purged++;
    }
  }
  return purged;
}

export function getAvatarStoreStats(): {
  totalAvatars: number;
  onlineAvatars: number;
  totalRooms: number;
} {
  let online = 0;
  for (const s of store.values()) { if (s.isOnline) online++; }
  return {
    totalAvatars: store.size,
    onlineAvatars: online,
    totalRooms: roomIndex.size,
  };
}

// ── Seed 20 benchmark avatars ────────────────────────────────────────────────

const MOOD_CYCLE: AvatarMood[] = ['neutral', 'grooving', 'excited', 'chilling', 'hyped', 'focused', 'celebrating'];
const GESTURE_CYCLE: AvatarGesture[] = ['idle', 'dance', 'clap', 'wave', 'cheer', 'lean', 'sit', 'point'];
const AURA_COLORS = ['#AA2DFF', '#00FFFF', '#FFD700', '#FF2DAA', '#00FF88'];
const BASE_COLORS  = ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#2d6a4f'];

export function seedBenchmarkAvatars(roomId: string, count = 20): AvatarState[] {
  const avatars: AvatarState[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const userId = `bench-${roomId}-${i}`;
    const state: AvatarState = {
      userId,
      displayName: `Avatar ${i + 1}`,
      role: i === 0 ? 'performer' : i < 3 ? 'vip' : i < 6 ? 'sponsor' : 'fan',
      roomId,
      seat: { row, col, sectionId: row === 0 ? 'front-floor' : 'floor', isStanding: row < 2 },
      outfit: {
        base: BASE_COLORS[i % BASE_COLORS.length]!,
        aura: i < 3 ? AURA_COLORS[i % AURA_COLORS.length] : undefined,
        headwear: i === 0 ? 'crown' : i % 4 === 0 ? 'headphones' : undefined,
        accessory: i === 0 ? 'mic' : i % 5 === 0 ? 'drink' : undefined,
      },
      mood: MOOD_CYCLE[i % MOOD_CYCLE.length]!,
      gesture: GESTURE_CYCLE[i % GESTURE_CYCLE.length]!,
      friendCluster: i > 0 && i < 5 ? { clusterId: 'cluster-a', memberIds: ['bench-0','bench-1','bench-2','bench-3','bench-4'], anchorSeatId: `seat-0-2` } : null,
      energyLevel: 0.5 + (i % 5) * 0.1,
      lastSeenAt: now,
      joinedAt: now,
      totalSessionMs: 0,
      isOnline: true,
    };
    upsertAvatar(state);
    avatars.push(state);
  }

  return avatars;
}
