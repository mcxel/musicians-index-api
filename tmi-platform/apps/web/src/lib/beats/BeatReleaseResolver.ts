import type { Beat } from "@/lib/beats/BeatStoreCommerceEngine";
import { formatCountdownMs } from "@/lib/live/CountdownResolver";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BeatReleaseStatus = "live" | "dropping-soon" | "scheduled" | "expired";

export type BeatReleaseWindow = {
  beatId: string;
  title: string;
  producerName: string;
  genre: string;
  releasesAt: Date;
  expiresAt: Date;
  status: BeatReleaseStatus;
  countdownLabel: string;
  purchaseRoute: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStatus(now: Date, releasesAt: Date, expiresAt: Date): BeatReleaseStatus {
  const ms = now.getTime();
  if (ms >= expiresAt.getTime()) return "expired";
  if (ms >= releasesAt.getTime()) return "live";
  const msToDrop = releasesAt.getTime() - ms;
  if (msToDrop <= 30 * 60 * 1000) return "dropping-soon";
  return "scheduled";
}

function resolveCountdownLabel(
  now: Date,
  releasesAt: Date,
  expiresAt: Date,
  status: BeatReleaseStatus,
): string {
  if (status === "expired") return "Release window closed";
  if (status === "live") {
    const msLeft = expiresAt.getTime() - now.getTime();
    return `Available for ${formatCountdownMs(msLeft)}`;
  }
  const msLeft = releasesAt.getTime() - now.getTime();
  return `Drops in ${formatCountdownMs(msLeft)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve a beat release window from a Beat record and a scheduled release time.
 * Availability window defaults to 72 hours from release.
 */
export function resolveBeatReleaseWindow(
  beat: Beat,
  releasesAt: Date,
  now: Date,
  windowHours = 72,
): BeatReleaseWindow {
  const expiresAt = new Date(releasesAt.getTime() + windowHours * 60 * 60 * 1000);
  const status = resolveStatus(now, releasesAt, expiresAt);
  return {
    beatId: beat.id,
    title: beat.title,
    producerName: beat.producerName,
    genre: beat.genre,
    releasesAt,
    expiresAt,
    status,
    countdownLabel: resolveCountdownLabel(now, releasesAt, expiresAt, status),
    purchaseRoute: `/beats/${beat.id}`,
  };
}

/**
 * Pick the soonest non-expired release window from a list, or return null.
 */
export function pickNextRelease(
  windows: BeatReleaseWindow[],
): BeatReleaseWindow | null {
  const active = windows
    .filter((w) => w.status !== "expired")
    .sort((a, b) => a.releasesAt.getTime() - b.releasesAt.getTime());
  return active[0] ?? null;
}
