/**
 * Host-selected Cypher turn duration — 30 / 45 / 60 seconds (default 60).
 * Must persist in authoritative room configuration (Claude). This module is the
 * shared contract + client persistence helper until room-config write is wired.
 */

export const CYPHER_TURN_DURATION_POLICY_ID = "CYPHER_TURN_DURATION_v1" as const;

export const CYPHER_TURN_DURATION_OPTIONS = [30, 45, 60] as const;
export type CypherTurnDurationSeconds = (typeof CYPHER_TURN_DURATION_OPTIONS)[number];
export const CYPHER_TURN_DURATION_DEFAULT: CypherTurnDurationSeconds = 60;

export const NEW_CYPHER_TIMER_ENGINE = false as const;

export function normalizeCypherTurnDuration(raw: unknown): CypherTurnDurationSeconds {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (n === 30 || n === 45 || n === 60) return n;
  return CYPHER_TURN_DURATION_DEFAULT;
}

const STORAGE_KEY = "tmi.cypher.turnDuration.v1";

/** Local draft only — reconnect must re-read server room config when available. */
export function readLocalCypherTurnDurationDraft(roomId: string): CypherTurnDurationSeconds | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}:${roomId}`);
    return raw ? normalizeCypherTurnDuration(Number(raw)) : null;
  } catch {
    return null;
  }
}

export function writeLocalCypherTurnDurationDraft(
  roomId: string,
  seconds: CypherTurnDurationSeconds,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${STORAGE_KEY}:${roomId}`, String(normalizeCypherTurnDuration(seconds)));
}

/**
 * Prefer server duration; fall back to local draft; else default 60.
 * Never invent mid-turn changes after authoritative start.
 */
export function resolveCypherTurnDuration(input: {
  serverSeconds?: number | null;
  localDraftSeconds?: number | null;
}): CypherTurnDurationSeconds {
  if (input.serverSeconds != null) return normalizeCypherTurnDuration(input.serverSeconds);
  if (input.localDraftSeconds != null) return normalizeCypherTurnDuration(input.localDraftSeconds);
  return CYPHER_TURN_DURATION_DEFAULT;
}
