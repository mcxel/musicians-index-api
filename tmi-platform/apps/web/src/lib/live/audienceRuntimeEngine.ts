// AudienceRuntimeEngine — audience tracking, venue occupancy, presence

export type AudienceMember = {
  userId: string;
  displayName: string;
  role: "fan" | "artist" | "host" | "bot";
  joinedAt: number;
  seatId: string | null;
  active: boolean;
  captureEnabled: boolean;
  /** Friend-cluster key — members sharing a groupId are seated adjacent to each other when possible. */
  groupId?: string | null;
  viewpoint: {
    yaw: number;
    pitch: number;
    updatedAt: number;
  };
};

export type AudienceChatMessage = {
  id: string;
  venueSlug: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: number;
};

export type VenueOccupancy = {
  venueSlug: string;
  capacity: number;
  present: number;
  members: AudienceMember[];
  peakPresent: number;
};

export type VenueModerationPolicy = {
  venueSlug: string;
  slowModeMs: number;
  mutedUserIds: string[];
  updatedAt: number;
};

const occupancyRegistry = new Map<string, VenueOccupancy>();
const chatRegistry = new Map<string, AudienceChatMessage[]>();
const chatRateRegistry = new Map<string, number[]>();
const chatLastMessageRegistry = new Map<string, number>();
const moderationRegistry = new Map<string, VenueModerationPolicy>();

const CHAT_WINDOW_MS = 15_000;
const CHAT_MAX_PER_WINDOW = 5;
const CHAT_MAX_LENGTH = 240;
const BLOCKED_CHAT_PATTERNS = [
  /https?:\/\//i,
  /\b(?:discord\.gg|telegram|whatsapp)\b/i,
  /\b(?:hate|kill|porn|nude)\b/i,
];

const DEFAULT_CAPACITY = 10000;

export function getVenueModerationPolicy(venueSlug: string): VenueModerationPolicy {
  if (!moderationRegistry.has(venueSlug)) {
    moderationRegistry.set(venueSlug, {
      venueSlug,
      slowModeMs: 0,
      mutedUserIds: [],
      updatedAt: Date.now(),
    });
  }
  return moderationRegistry.get(venueSlug)!;
}

export function getVenueOccupancy(venueSlug: string): VenueOccupancy {
  if (!occupancyRegistry.has(venueSlug)) {
    occupancyRegistry.set(venueSlug, {
      venueSlug,
      capacity: DEFAULT_CAPACITY,
      present: 0,
      members: [],
      peakPresent: 0,
    });
  }
  return occupancyRegistry.get(venueSlug)!;
}

export function joinAudience(venueSlug: string, member: {
  userId: string;
  displayName: string;
  role: "fan" | "artist" | "host" | "bot";
  seatId: string | null;
  captureEnabled?: boolean;
  groupId?: string | null;
  viewpoint?: {
    yaw: number;
    pitch: number;
    updatedAt: number;
  };
}): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const existing = occ.members.find((m) => m.userId === member.userId);
  if (existing) {
    existing.active = true;
    existing.displayName = member.displayName;
    existing.role = member.role;
    existing.captureEnabled = member.captureEnabled ?? existing.captureEnabled;
    existing.seatId = member.seatId;
    existing.groupId = member.groupId ?? existing.groupId ?? null;
    existing.viewpoint = member.viewpoint ?? existing.viewpoint;
    return occ;
  }
  occ.members.push({
    ...member,
    groupId: member.groupId ?? null,
    joinedAt: Date.now(),
    active: true,
    viewpoint: member.viewpoint ?? { yaw: 0, pitch: 0, updatedAt: Date.now() },
    captureEnabled: member.captureEnabled ?? false,
  });
  occ.present = occ.members.filter((m) => m.active).length;
  occ.peakPresent = Math.max(occ.peakPresent, occ.present);
  return occ;
}

export function leaveAudience(venueSlug: string, userId: string): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const member = occ.members.find((m) => m.userId === userId);
  if (member) {
    member.active = false;
  }
  occ.present = occ.members.filter((m) => m.active).length;
  return occ;
}

export function getAudienceSnapshot(venueSlug: string) {
  const occ = getVenueOccupancy(venueSlug);
  const moderation = getVenueModerationPolicy(venueSlug);
  return {
    venueSlug: occ.venueSlug,
    present: occ.present,
    capacity: occ.capacity,
    peakPresent: occ.peakPresent,
    occupancyPct: Math.round((occ.present / occ.capacity) * 100),
    activeMembers: occ.members.filter((m) => m.active).slice(0, 100),
    moderation,
  };
}

export function updateAudienceViewpoint(venueSlug: string, userId: string, yaw: number, pitch: number): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const member = occ.members.find((m) => m.userId === userId);
  if (!member) return occ;
  member.viewpoint = {
    yaw: Math.max(-180, Math.min(180, Math.round(yaw))),
    pitch: Math.max(-80, Math.min(80, Math.round(pitch))),
    updatedAt: Date.now(),
  };
  return occ;
}

export function setAudienceCaptureEnabled(venueSlug: string, userId: string, captureEnabled: boolean): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const member = occ.members.find((m) => m.userId === userId);
  if (!member) return occ;
  member.captureEnabled = captureEnabled;
  return occ;
}

export function postAudienceMessage(venueSlug: string, input: {
  userId: string;
  displayName: string;
  text: string;
}): AudienceChatMessage[] {
  const current = chatRegistry.get(venueSlug) ?? [];
  const message: AudienceChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    venueSlug,
    userId: input.userId,
    displayName: input.displayName,
    text: input.text.trim().slice(0, CHAT_MAX_LENGTH),
    createdAt: Date.now(),
  };
  const next = [...current, message].slice(-120);
  chatRegistry.set(venueSlug, next);
  return next;
}

export function getAudienceMessages(venueSlug: string): AudienceChatMessage[] {
  return chatRegistry.get(venueSlug) ?? [];
}

export function validateAudienceMessage(venueSlug: string, userId: string, text: string): {
  ok: boolean;
  cleanText: string;
  reason?: string;
} {
  const moderation = getVenueModerationPolicy(venueSlug);
  if (moderation.mutedUserIds.includes(userId)) {
    return { ok: false, cleanText: '', reason: 'You are muted in this arena' };
  }

  const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, CHAT_MAX_LENGTH);
  if (!cleanText) return { ok: false, cleanText, reason: 'Message is empty' };
  if (BLOCKED_CHAT_PATTERNS.some((pattern) => pattern.test(cleanText))) {
    return { ok: false, cleanText, reason: 'Message blocked by safety policy' };
  }

  const now = Date.now();
  const key = `${venueSlug}:${userId}`;

  if (moderation.slowModeMs > 0) {
    const lastAt = chatLastMessageRegistry.get(key) ?? 0;
    if (now - lastAt < moderation.slowModeMs) {
      const seconds = Math.ceil((moderation.slowModeMs - (now - lastAt)) / 1000);
      return { ok: false, cleanText, reason: `Slow mode active: wait ${seconds}s` };
    }
  }

  const existing = chatRateRegistry.get(key) ?? [];
  const withinWindow = existing.filter((ts) => now - ts <= CHAT_WINDOW_MS);
  if (withinWindow.length >= CHAT_MAX_PER_WINDOW) {
    chatRateRegistry.set(key, withinWindow);
    return { ok: false, cleanText, reason: 'Rate limit exceeded' };
  }

  chatRateRegistry.set(key, [...withinWindow, now]);
  chatLastMessageRegistry.set(key, now);
  return { ok: true, cleanText };
}

export function setVenueSlowMode(venueSlug: string, slowModeMs: number): VenueModerationPolicy {
  const moderation = getVenueModerationPolicy(venueSlug);
  moderation.slowModeMs = Math.max(0, Math.min(60_000, Math.round(slowModeMs)));
  moderation.updatedAt = Date.now();
  moderationRegistry.set(venueSlug, moderation);
  return moderation;
}

export function muteAudienceMember(venueSlug: string, userId: string): VenueModerationPolicy {
  const moderation = getVenueModerationPolicy(venueSlug);
  if (!moderation.mutedUserIds.includes(userId)) {
    moderation.mutedUserIds.push(userId);
  }
  moderation.updatedAt = Date.now();
  moderationRegistry.set(venueSlug, moderation);
  return moderation;
}

export function unmuteAudienceMember(venueSlug: string, userId: string): VenueModerationPolicy {
  const moderation = getVenueModerationPolicy(venueSlug);
  moderation.mutedUserIds = moderation.mutedUserIds.filter((id) => id !== userId);
  moderation.updatedAt = Date.now();
  moderationRegistry.set(venueSlug, moderation);
  return moderation;
}

export function listAllOccupancies(): VenueOccupancy[] {
  return Array.from(occupancyRegistry.values());
}

// ── Seat auto-assignment ─────────────────────────────────────────────────────

function seatNumber(seatId: string): number | null {
  const m = /^seat-(\d+)$/.exec(seatId);
  return m ? Number(m[1]) : null;
}

function firstFreeSeat(taken: Set<string>): string {
  for (let i = 1; i <= DEFAULT_CAPACITY; i++) {
    const id = `seat-${i}`;
    if (!taken.has(id)) return id;
  }
  return `seat-${Date.now()}`;
}

/**
 * FriendClusterEngine (minimal) — when groupId is supplied and another active
 * member of that group already has a seat, seats the new joiner in the
 * nearest free seat to that group member (expanding outward) instead of the
 * first globally-free seat. Falls back to normal sequential assignment when
 * no groupId is given or no group member is seated yet.
 */
export function assignNextSeat(venueSlug: string, groupId?: string | null): string {
  const occ = getVenueOccupancy(venueSlug);
  const taken = new Set(
    occ.members
      .map((m) => (m.active ? m.seatId : null))
      .filter((id): id is string => id !== null),
  );

  if (groupId) {
    const groupSeats = occ.members
      .filter((m) => m.active && m.groupId === groupId && m.seatId)
      .map((m) => seatNumber(m.seatId!))
      .filter((n): n is number => n !== null);

    if (groupSeats.length > 0) {
      const anchor = Math.min(...groupSeats);
      for (let offset = 1; offset <= DEFAULT_CAPACITY; offset++) {
        const right = `seat-${anchor + offset}`;
        if (!taken.has(right)) return right;
        const left = anchor - offset;
        if (left >= 1) {
          const leftId = `seat-${left}`;
          if (!taken.has(leftId)) return leftId;
        }
      }
    }
  }

  return firstFreeSeat(taken);
}

// ── Bot roster for seeding ───────────────────────────────────────────────────

const BOT_NAMES = [
  'NovaCrowd', 'BeatWatcher', 'PulseFan', 'ArenaVibe', 'WaveRoom',
  'CrownSeat', 'NeonFam', 'StageEye', 'RhythmBot', 'GrooveBot',
  'CypherFan', 'BassDrop', 'FreqWatch', 'LobbyBot', 'VenueVibe',
  'SoulSeat', 'FlowBot', 'ChantBot', 'ReactionBot', 'HypeBot',
  'VoltFan', 'SpinBot', 'GlowSeat', 'EchoBot', 'MixBot',
];
const BOT_EMOJIS = ['🎧', '🔥', '🎶', '✨', '🎤', '💫', '🪩', '👑', '🎵', '⭐'];

export function seedRoomWithBots(venueSlug: string, count = 20): VenueOccupancy {
  const occ = getVenueOccupancy(venueSlug);
  const existing = new Set(occ.members.map((m) => m.userId));
  let seeded = 0;
  for (let i = 0; i < count && i < BOT_NAMES.length; i++) {
    const botId = `bot-${venueSlug}-${i + 1}`;
    if (existing.has(botId)) continue;
    joinAudience(venueSlug, {
      userId: botId,
      displayName: BOT_NAMES[i] ?? `Bot${i + 1}`,
      role: 'bot',
      seatId: `seat-${i + 1}`,
      captureEnabled: false,
      viewpoint: { yaw: Math.round((i / count) * 120 - 60), pitch: -10, updatedAt: Date.now() },
    });
    seeded++;
  }
  // Stagger bot reactions over time (cosmetic — changes reactions field on existing bots)
  const reactions = ['🔥', '💬', '⚡', '👑', '🎤', '💸', '🙌', '😤', '🎵', '🥵'];
  occ.members
    .filter((m) => m.role === 'bot')
    .forEach((m, i) => {
      // Store emoji hint in displayName suffix (parsed by seat grid renderer)
      if (!m.displayName.includes('|')) {
        m.displayName = `${m.displayName}|${BOT_EMOJIS[i % BOT_EMOJIS.length] ?? '🎧'}`;
      }
    });
  void seeded; // suppress unused warning
  return occ;
}
