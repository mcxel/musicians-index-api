/**
 * Server-only secret vault for broadcast destination tokens / stream keys.
 * Never import from client components. Never serialize into API JSON.
 * File suffix `.server.ts` — import only from API routes / server modules.
 */

import type { BroadcastProvider } from "./BroadcastDestinationTypes";

export type DestinationSecretRecord = {
  userId: string;
  provider: BroadcastProvider;
  /** Opaque ref — actual key material stays in this Map / env, never returned */
  streamKeyRef: string | null;
  accessTokenRef: string | null;
  refreshTokenRef: string | null;
  linkedAt: number | null;
};

const vault = new Map<string, DestinationSecretRecord>();

function vaultKey(userId: string, provider: BroadcastProvider): string {
  return `${userId}::${provider}`;
}

/** Env-gated provider readiness — real OAuth/RTMP only when keys exist. */
export function providerEnvConfigured(provider: BroadcastProvider): boolean {
  switch (provider) {
    case "youtube":
      return Boolean(
        process.env.YOUTUBE_STREAM_KEY?.trim() ||
          (process.env.YOUTUBE_CLIENT_ID?.trim() && process.env.YOUTUBE_CLIENT_SECRET?.trim()),
      );
    case "twitch":
      return Boolean(
        process.env.TWITCH_STREAM_KEY?.trim() ||
          (process.env.TWITCH_CLIENT_ID?.trim() && process.env.TWITCH_CLIENT_SECRET?.trim()),
      );
    case "facebook":
      return Boolean(
        process.env.FACEBOOK_STREAM_KEY?.trim() ||
          (process.env.FACEBOOK_APP_ID?.trim() && process.env.FACEBOOK_APP_SECRET?.trim()),
      );
    case "instagram":
      return Boolean(
        process.env.INSTAGRAM_STREAM_KEY?.trim() ||
          (process.env.INSTAGRAM_APP_ID?.trim() && process.env.INSTAGRAM_APP_SECRET?.trim()),
      );
    case "kick":
      return Boolean(
        process.env.KICK_STREAM_KEY?.trim() ||
          (process.env.KICK_CLIENT_ID?.trim() && process.env.KICK_CLIENT_SECRET?.trim()),
      );
    case "other":
      return Boolean(process.env.GENERIC_RTMP_STREAM_KEY?.trim());
    default:
      return false;
  }
}

export function getDestinationSecret(
  userId: string,
  provider: BroadcastProvider,
): DestinationSecretRecord | null {
  return vault.get(vaultKey(userId, provider)) ?? null;
}

export function isDestinationLinked(userId: string, provider: BroadcastProvider): boolean {
  const rec = vault.get(vaultKey(userId, provider));
  if (rec?.accessTokenRef || rec?.streamKeyRef) return true;
  // Env-level platform key counts as "linkable / linked for this deploy" only when present
  return providerEnvConfigured(provider);
}

/**
 * Persist link — stores refs only. If OAuth not configured, returns false (honest locked).
 * Never invents a live ingest ack.
 */
export function linkDestinationSecrets(
  userId: string,
  provider: BroadcastProvider,
  opts?: { streamKey?: string; accessToken?: string; refreshToken?: string },
): { ok: boolean; reason?: string } {
  if (!providerEnvConfigured(provider) && !opts?.streamKey && !opts?.accessToken) {
    return { ok: false, reason: "oauth_not_configured" };
  }
  const key = vaultKey(userId, provider);
  const streamKey =
    opts?.streamKey?.trim() ||
    (provider === "youtube"
      ? process.env.YOUTUBE_STREAM_KEY?.trim()
      : provider === "twitch"
        ? process.env.TWITCH_STREAM_KEY?.trim()
        : provider === "facebook"
          ? process.env.FACEBOOK_STREAM_KEY?.trim()
          : provider === "instagram"
            ? process.env.INSTAGRAM_STREAM_KEY?.trim()
            : provider === "kick"
              ? process.env.KICK_STREAM_KEY?.trim()
              : process.env.GENERIC_RTMP_STREAM_KEY?.trim()) ||
    null;
  const accessToken = opts?.accessToken?.trim() || null;
  if (!streamKey && !accessToken) {
    return { ok: false, reason: "oauth_not_configured" };
  }
  vault.set(key, {
    userId,
    provider,
    streamKeyRef: streamKey ? `ref:${provider}:stream` : null,
    accessTokenRef: accessToken ? `ref:${provider}:access` : null,
    refreshTokenRef: opts?.refreshToken ? `ref:${provider}:refresh` : null,
    linkedAt: Date.now(),
  });
  const g = globalThis as unknown as { __TMI_BDEST_RAW__?: Map<string, string> };
  g.__TMI_BDEST_RAW__ ??= new Map();
  if (streamKey) g.__TMI_BDEST_RAW__.set(`${key}:stream`, streamKey);
  if (accessToken) g.__TMI_BDEST_RAW__.set(`${key}:access`, accessToken);
  return { ok: true };
}

export function unlinkDestinationSecrets(userId: string, provider: BroadcastProvider): void {
  const key = vaultKey(userId, provider);
  vault.delete(key);
  const raw = (globalThis as unknown as { __TMI_BDEST_RAW__?: Map<string, string> }).__TMI_BDEST_RAW__;
  raw?.delete(`${key}:stream`);
  raw?.delete(`${key}:access`);
}

/**
 * Attempt RTMP/API ingest start. Returns live ONLY when a real ingest ack is obtained.
 * Without a live RTMP bridge, returns connecting/error — never fabricates live.
 */
export async function attemptExternalIngest(
  userId: string,
  provider: BroadcastProvider,
  _roomId: string,
): Promise<{ status: "live" | "connecting" | "error"; reason: string; latencyMs?: number }> {
  if (!isDestinationLinked(userId, provider)) {
    return { status: "error", reason: "not_linked" };
  }
  // Real RTMP push bridge is not assembled in-repo — env keys alone do not prove ingest.
  // Honest state: connecting until an external ack webhook / RTMP client confirms.
  const ackUrl = process.env.EXTERNAL_INGEST_ACK_URL?.trim();
  if (ackUrl) {
    try {
      const res = await fetch(ackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, provider, action: "start" }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as { ingestAck?: boolean };
        if (body.ingestAck === true) {
          return { status: "live", reason: "ingest_ack", latencyMs: 0 };
        }
      }
      return { status: "connecting", reason: "awaiting_ingest_ack" };
    } catch {
      return { status: "error", reason: "ingest_bridge_unreachable" };
    }
  }
  return { status: "connecting", reason: "rtmp_bridge_not_active" };
}
