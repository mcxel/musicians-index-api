/**
 * GauntletMemoryHooks — survivor/champion badge capture into Memory Wall when available.
 * Client-safe: posts to an authorized API; never imports Prisma / MemoryWallEngine.
 */

export type GauntletBadgeKind = "SURVIVOR" | "CHAMPION";

export type GauntletBadgePayload = {
  userId: string;
  roomId: string;
  runId: string;
  kind: GauntletBadgeKind;
  roundSize?: number;
  title: string;
};

/**
 * Capture via HTTP so the Lounge/Gauntlet client bundle never pulls MemoryWallEngine → prisma.
 * Server route (when present) owns durable persistence; honest no-op on network failure.
 */
export async function captureGauntletBadge(
  payload: GauntletBadgePayload,
): Promise<{ ok: boolean; artifactId?: string; reason?: string }> {
  try {
    if (typeof fetch !== "function") {
      return { ok: false, reason: "memory-wall-unavailable" };
    }
    const res = await fetch("/api/memory/gauntlet-badge", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, reason: `memory-wall-http-${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      artifactId?: string;
      reason?: string;
    };
    if (data.ok && data.artifactId) {
      return { ok: true, artifactId: data.artifactId };
    }
    return { ok: false, reason: data.reason ?? "memory-wall-unavailable" };
  } catch {
    return { ok: false, reason: "memory-wall-unavailable" };
  }
}

export function survivorBadgeTitle(roundSize: number): string {
  return `Gauntlet Survivor — Round of ${roundSize}`;
}

export function championBadgeTitle(): string {
  return "TMI Musical Gauntlet Champion";
}
