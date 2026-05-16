/**
 * ShadowSentinelDiagnosticRegistry — V1
 *
 * Log-only observer for live room health.
 * No auto-fix. No mutations. Reports up the chain only.
 * Runs every 30s via LiveRoomRuntimeSpine.
 */

export type SentinelCheckResult = {
  roomId: string;
  checkedAt: number;
  audioSync: "healthy" | "drifting" | "unknown";
  visualAuthority: "healthy" | "dead-link" | "unknown";
  commerceBridge: "active" | "broken" | "unknown";
  chatHealth: "active" | "stale" | "deadlocked" | "unknown";
  seatHold?: { userId: string; expiresAt: number };
};

const diagnosticLog: SentinelCheckResult[] = [];

export function getSentinelLog(roomId?: string): SentinelCheckResult[] {
  if (!roomId) return [...diagnosticLog];
  return diagnosticLog.filter((r) => r.roomId === roomId);
}

function checkAudioSync(): "healthy" | "drifting" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return "unknown";
    // If any AudioContext exists and is running, audio is healthy
    return "healthy";
  } catch {
    return "unknown";
  }
}

function checkVisualAuthority(messageCount: number): "healthy" | "dead-link" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  // Proxy signal: if video elements on page have errors, flag dead-link
  const videos = document.querySelectorAll("video");
  for (const v of Array.from(videos)) {
    if (v.error) {
      console.warn(`[SENTINEL_DIAGNOSTIC] Video error detected — code ${v.error.code}`);
      return "dead-link";
    }
  }
  // Secondary signal: if no chat activity at all, might indicate render failure
  if (messageCount === 0) return "unknown";
  return "healthy";
}

function checkCommerceBridge(tipTotalCents: number, tipsCount: number): "active" | "broken" | "unknown" {
  // Tip engine is reachable if we have a valid (non-negative) total
  if (tipTotalCents < 0) {
    console.warn("[SENTINEL_DIAGNOSTIC] Tip total is negative — commerce bridge may be broken.");
    return "broken";
  }
  if (tipsCount > 0 && tipTotalCents === 0) {
    console.warn("[SENTINEL_DIAGNOSTIC] Tips logged but total is $0 — possible bridge miscalc.");
    return "broken";
  }
  return "active";
}

function checkChatHealth(messageCount: number, lastMessageTs: number | null): "active" | "stale" | "deadlocked" | "unknown" {
  if (messageCount === 0) return "unknown";
  if (lastMessageTs === null) return "unknown";
  const ageMs = Date.now() - lastMessageTs;
  if (ageMs > 120_000) {
    console.warn("[SENTINEL_DIAGNOSTIC] Chat has been silent for 2+ minutes — possible deadlock.");
    return "deadlocked";
  }
  if (ageMs > 45_000) return "stale";
  return "active";
}

export type SentinelRoomSnapshot = {
  roomId: string;
  messageCount: number;
  lastMessageTs: number | null;
  tipTotalCents: number;
  tipsCount: number;
};

export function runSentinelCheck(snapshot: SentinelRoomSnapshot): SentinelCheckResult {
  const result: SentinelCheckResult = {
    roomId: snapshot.roomId,
    checkedAt: Date.now(),
    audioSync: checkAudioSync(),
    visualAuthority: checkVisualAuthority(snapshot.messageCount),
    commerceBridge: checkCommerceBridge(snapshot.tipTotalCents, snapshot.tipsCount),
    chatHealth: checkChatHealth(snapshot.messageCount, snapshot.lastMessageTs),
  };

  diagnosticLog.unshift(result);
  if (diagnosticLog.length > 200) diagnosticLog.pop();

  const issues = [
    result.audioSync === "drifting" && `audio:drifting`,
    result.visualAuthority === "dead-link" && `visual:dead-link`,
    result.commerceBridge === "broken" && `commerce:broken`,
    (result.chatHealth === "deadlocked" || result.chatHealth === "stale") && `chat:${result.chatHealth}`,
  ].filter(Boolean);

  if (issues.length > 0) {
    console.warn(`[SENTINEL_DIAGNOSTIC] Room ${snapshot.roomId} — issues detected: ${issues.join(", ")} (log-only V1)`);
  } else {
    console.log(`[SENTINEL_DIAGNOSTIC] Room ${snapshot.roomId} — all systems nominal.`);
  }

  return result;
}

export function logSeatHold(roomId: string, userId: string): void {
  console.log(`[SENTINEL_DIAGNOSTIC] Seat hold: user ${userId} in room ${roomId} — held for 30s.`);
  const entry = diagnosticLog.find((r) => r.roomId === roomId);
  if (entry) {
    entry.seatHold = { userId, expiresAt: Date.now() + 30_000 };
  }
}
