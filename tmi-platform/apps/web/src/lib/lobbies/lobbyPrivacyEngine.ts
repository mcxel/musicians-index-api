/**
 * lobbyPrivacyEngine.ts
 *
 * Lobby privacy enforcement for TMI platform.
 *
 * Rules:
 * - PUBLIC lobbies: anyone can join, discoverable in listings
 * - PRIVATE lobbies: invite-only, not listed in discovery, bots cannot enter
 * - YOUTH lobbies: only age-verified youth users (under 18), no adult bots
 * - ADULT lobbies: age-gated, under-18 users blocked
 * - INVITE-ONLY: specific userId list, no discovery
 */

export type LobbyPrivacyType = "public" | "private" | "invite-only" | "youth" | "adult";

export type LobbyPrivacyConfig = {
  lobbyId: string;
  privacyType: LobbyPrivacyType;
  ownerId: string;
  invitedUserIds: string[];
  maxCapacity: number;
  botAccessAllowed: boolean;
  ageGate?: "youth" | "adult";
  createdAt: number;
};

export type LobbyAccessResult = {
  allowed: boolean;
  reason: string;
  logged: boolean;
};

export type LobbyAccessLogEntry = {
  id: string;
  lobbyId: string;
  userId: string;
  privacyType: LobbyPrivacyType;
  allowed: boolean;
  reason: string;
  isBot: boolean;
  timestamp: number;
};

const lobbyRegistry = new Map<string, LobbyPrivacyConfig>();
const lobbyAccessLog: LobbyAccessLogEntry[] = [];
let logCounter = 1;

function logAccess(
  lobbyId: string,
  userId: string,
  privacyType: LobbyPrivacyType,
  allowed: boolean,
  reason: string,
  isBot: boolean
): LobbyAccessLogEntry {
  const entry: LobbyAccessLogEntry = {
    id: `LAL-${String(logCounter++).padStart(6, "0")}`,
    lobbyId,
    userId,
    privacyType,
    allowed,
    reason,
    isBot,
    timestamp: Date.now(),
  };
  lobbyAccessLog.push(entry);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:lobby-access", { detail: entry }));
  }

  return entry;
}

/**
 * Register a lobby with its privacy configuration.
 */
export function registerLobby(config: LobbyPrivacyConfig): void {
  lobbyRegistry.set(config.lobbyId, config);
}

/**
 * Check if a user can access a lobby.
 */
export function checkLobbyAccess(
  lobbyId: string,
  userId: string,
  userAge?: number,
  isBot = false
): LobbyAccessResult {
  const config = lobbyRegistry.get(lobbyId);

  if (!config) {
    // Unknown lobbies default to public
    const entry = logAccess(lobbyId, userId, "public", true, "Unknown lobby — defaulting to public", isBot);
    return { allowed: true, reason: entry.reason, logged: true };
  }

  const { privacyType, invitedUserIds, ownerId, ageGate, botAccessAllowed } = config;

  // Bots cannot enter private, invite-only, or youth lobbies
  if (isBot && !botAccessAllowed) {
    const entry = logAccess(lobbyId, userId, privacyType, false, "Bots not allowed in this lobby", isBot);
    return { allowed: false, reason: entry.reason, logged: true };
  }

  // Youth lobbies: block adult-classified users and adult bots
  if (privacyType === "youth" || ageGate === "youth") {
    if (userAge !== undefined && userAge >= 18) {
      const entry = logAccess(lobbyId, userId, privacyType, false, "Adult user blocked from youth lobby", isBot);
      return { allowed: false, reason: entry.reason, logged: true };
    }
  }

  // Adult lobbies: block under-18 users
  if (privacyType === "adult" || ageGate === "adult") {
    if (userAge !== undefined && userAge < 18) {
      const entry = logAccess(lobbyId, userId, privacyType, false, "Under-18 user blocked from adult lobby", isBot);
      return { allowed: false, reason: entry.reason, logged: true };
    }
  }

  // Private lobbies: owner only + invited list
  if (privacyType === "private" || privacyType === "invite-only") {
    const isOwner = userId === ownerId;
    const isInvited = invitedUserIds.includes(userId);
    if (!isOwner && !isInvited) {
      const entry = logAccess(
        lobbyId,
        userId,
        privacyType,
        false,
        "Private lobby — user not invited",
        isBot
      );
      return { allowed: false, reason: entry.reason, logged: true };
    }
  }

  // Public — allow
  const entry = logAccess(lobbyId, userId, privacyType, true, "Access granted", isBot);
  return { allowed: true, reason: entry.reason, logged: true };
}

/**
 * Update the privacy type of an existing lobby.
 */
export function updateLobbyPrivacy(
  lobbyId: string,
  newType: LobbyPrivacyType,
  updatedBy: string
): boolean {
  const config = lobbyRegistry.get(lobbyId);
  if (!config) return false;
  config.privacyType = newType;
  config.botAccessAllowed = newType === "public";

  logAccess(
    lobbyId,
    updatedBy,
    newType,
    true,
    `Privacy updated to ${newType} by ${updatedBy}`,
    false
  );
  return true;
}

/**
 * Get all public lobbies (for discovery listing).
 */
export function getPublicLobbies(): LobbyPrivacyConfig[] {
  return Array.from(lobbyRegistry.values()).filter(
    (l) => l.privacyType === "public"
  );
}

export function getLobbyAccessLog(): LobbyAccessLogEntry[] {
  return [...lobbyAccessLog];
}

export function getLobbyConfig(lobbyId: string): LobbyPrivacyConfig | undefined {
  return lobbyRegistry.get(lobbyId);
}

// ── Seed default public lobbies ─────────────────────────────────────────────
const DEFAULT_PUBLIC_LOBBIES: LobbyPrivacyConfig[] = [
  {
    lobbyId: "main-lobby",
    privacyType: "public",
    ownerId: "system",
    invitedUserIds: [],
    maxCapacity: 500,
    botAccessAllowed: true,
    createdAt: Date.now(),
  },
  {
    lobbyId: "cypher-arena",
    privacyType: "public",
    ownerId: "system",
    invitedUserIds: [],
    maxCapacity: 200,
    botAccessAllowed: true,
    createdAt: Date.now(),
  },
  {
    lobbyId: "discovery-lobby",
    privacyType: "public",
    ownerId: "system",
    invitedUserIds: [],
    maxCapacity: 100,
    botAccessAllowed: true,
    createdAt: Date.now(),
  },
  {
    lobbyId: "public-stage",
    privacyType: "public",
    ownerId: "system",
    invitedUserIds: [],
    maxCapacity: 1000,
    botAccessAllowed: true,
    createdAt: Date.now(),
  },
  {
    lobbyId: "youth-zone",
    privacyType: "youth",
    ownerId: "system",
    invitedUserIds: [],
    maxCapacity: 100,
    botAccessAllowed: false,
    ageGate: "youth",
    createdAt: Date.now(),
  },
];

for (const lobby of DEFAULT_PUBLIC_LOBBIES) {
  registerLobby(lobby);
}
