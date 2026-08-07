/**
 * GauntletMemoryHooks — survivor/champion badge capture into Memory Wall when available.
 * Honest no-op if Memory engines cannot accept the artifact.
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

export async function captureGauntletBadge(
  payload: GauntletBadgePayload,
): Promise<{ ok: boolean; artifactId?: string; reason?: string }> {
  try {
    const { MemoryWallEngine } = await import("@/lib/memory/MemoryWallEngine");
    const mediaUrl = `/images/tmi-placeholder.jpg`;
    const artifact = await MemoryWallEngine.captureLiveMoment(
      payload.userId,
      payload.runId,
      mediaUrl,
      payload.title,
    );
    return { ok: true, artifactId: artifact.id };
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
