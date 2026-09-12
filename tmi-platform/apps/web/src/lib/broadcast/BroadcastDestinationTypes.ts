/**
 * BroadcastDestination — public contract for external simulcast destinations.
 * Stream keys / OAuth tokens NEVER appear here (server-side only).
 * TMI itself is NOT an external bezel destination; it is the master session authority.
 */

export type BroadcastProvider =
  | "youtube"
  | "instagram"
  | "facebook"
  | "kick"
  | "twitch"
  | "custom"
  | "other";

/** Canonical 5-state machine for multi-destination distribution targets */
export type AuthoritativeDestinationState =
  | "OFF"
  | "READY"
  | "LIVE"
  | "WARNING"
  | "ERROR";

/** Master TMI broadcast / session status (distinct from individual destinations) */
export type MasterLiveBroadcastStatus =
  | "OFF"
  | "LIVE"
  | "WARNING"
  | "ERROR";

/** UI light states — ● live only after verified ingest ack. */
export type DestinationConnectionStatus =
  | "off"
  | "selected_off"
  | "connecting"
  | "live"
  | "retry"
  | "error"
  | "locked";

export type DestinationAuthState = "unlinked" | "linked" | "expired";

export type DestinationIngestType = "rtmp" | "hls" | "api" | "unknown";

export type DestinationHealth = "unknown" | "ok" | "degraded" | "down";

export interface BroadcastDestinationPublic {
  destinationId: string;
  provider: BroadcastProvider;
  /** Display label */
  label: string;
  /** Bezel short code: YT IG FB KK TW CST */
  shortCode: string;
  connectionStatus: DestinationConnectionStatus;
  authState: DestinationAuthState;
  ingestType: DestinationIngestType;
  enabled: boolean;
  health: DestinationHealth;
  retryState: { attempts: number; nextRetryAt: number | null };
  latencyMs: number | null;
  /** Authoritative 5-state resolution */
  authoritativeState?: AuthoritativeDestinationState;
  /** Honest status line for tray — never fabricates LIVE */
  statusLine?: string;
}

export const CANONICAL_BEZEL_PROVIDERS: ReadonlyArray<{
  provider: BroadcastProvider;
  shortCode: string;
  label: string;
}> = [
  { provider: "youtube", shortCode: "YT", label: "YouTube" },
  { provider: "instagram", shortCode: "IG", label: "Instagram" },
  { provider: "facebook", shortCode: "FB", label: "Facebook" },
  { provider: "kick", shortCode: "KK", label: "Kick" },
  { provider: "twitch", shortCode: "TW", label: "Twitch" },
  { provider: "custom", shortCode: "CST", label: "Custom RTMP" },
] as const;

export function destinationIdFor(userId: string, provider: BroadcastProvider): string {
  return `bdest-${userId}-${provider}`;
}

/** Resolves the authoritative state for an individual destination target */
export function resolveAuthoritativeDestinationState(
  dest: BroadcastDestinationPublic,
  masterLive: boolean = false,
  telemetry?: { latencyMs?: number | null; droppedFrameRate?: number | null },
): AuthoritativeDestinationState {
  if (dest.connectionStatus === "error") return "ERROR";
  if (dest.connectionStatus === "locked" || dest.authState === "unlinked") return "OFF";

  if (dest.connectionStatus === "retry") return "WARNING";

  // When live, check for degraded telemetry or normal transmission
  if (dest.connectionStatus === "live" && masterLive) {
    const highLatency = typeof telemetry?.latencyMs === "number" && telemetry.latencyMs > 800;
    const highDroppedFrames = typeof telemetry?.droppedFrameRate === "number" && telemetry.droppedFrameRate > 0.05;
    if (dest.health === "degraded" || highLatency || highDroppedFrames) {
      return "WARNING";
    }
    return "LIVE";
  }

  // Ready state: authenticated & configured, primed for transmission
  if (dest.authState === "linked" || dest.enabled || dest.connectionStatus === "selected_off") {
    return "READY";
  }

  return "OFF";
}

/** Resolves the master TMI live broadcast session status */
export function resolveMasterLiveStatus(
  isLivePublished: boolean,
  telemetry?: { latencyMs?: number | null; droppedFrameRate?: number | null; hasError?: boolean },
): MasterLiveBroadcastStatus {
  if (!isLivePublished) return "OFF";
  if (telemetry?.hasError) return "ERROR";
  if (
    (typeof telemetry?.latencyMs === "number" && telemetry.latencyMs > 600) ||
    (typeof telemetry?.droppedFrameRate === "number" && telemetry.droppedFrameRate > 0.05)
  ) {
    return "WARNING";
  }
  return "LIVE";
}

/** Glyph for bezel light — never shows ● unless status is live (verified ingest). */
export function destinationStatusGlyph(status: DestinationConnectionStatus | AuthoritativeDestinationState): string {
  switch (status) {
    case "LIVE":
    case "live":
      return "●";
    case "READY":
    case "connecting":
      return "◐";
    case "retry":
      return "◎";
    case "WARNING":
    case "error":
      return "⚠";
    case "ERROR":
      return "✕";
    case "locked":
      return "🔒";
    case "OFF":
    case "selected_off":
    case "off":
    default:
      return "○";
  }
}
