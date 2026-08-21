/**
 * BroadcastDestination — public contract for external simulcast destinations.
 * Stream keys / OAuth tokens NEVER appear here (server-side only).
 * TMI itself is NOT a bezel destination.
 */

export type BroadcastProvider =
  | "youtube"
  | "instagram"
  | "facebook"
  | "kick"
  | "twitch"
  | "other";

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
  /** Bezel short code: YT IG FB KK TW + */
  shortCode: string;
  connectionStatus: DestinationConnectionStatus;
  authState: DestinationAuthState;
  ingestType: DestinationIngestType;
  enabled: boolean;
  health: DestinationHealth;
  retryState: { attempts: number; nextRetryAt: number | null };
  latencyMs: number | null;
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
] as const;

export function destinationIdFor(userId: string, provider: BroadcastProvider): string {
  return `bdest-${userId}-${provider}`;
}

/** Glyph for bezel light — never shows ● unless status is live (verified ingest). */
export function destinationStatusGlyph(status: DestinationConnectionStatus): string {
  switch (status) {
    case "live":
      return "●";
    case "connecting":
      return "◐";
    case "retry":
      return "◎";
    case "error":
      return "⚠";
    case "locked":
      return "🔒";
    case "selected_off":
      return "○";
    case "off":
    default:
      return "○";
  }
}
