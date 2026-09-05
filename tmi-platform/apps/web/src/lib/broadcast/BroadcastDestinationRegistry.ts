/**
 * BroadcastDestinationRegistry — client-side public destination state.
 * Tokens never stored here. Hydrate from GET /api/broadcast/destinations.
 */

"use client";

import {
  CANONICAL_BEZEL_PROVIDERS,
  destinationIdFor,
  destinationStatusGlyph,
  type BroadcastDestinationPublic,
  type BroadcastProvider,
  type DestinationConnectionStatus,
} from "./BroadcastDestinationTypes";

export { destinationStatusGlyph };

type Listener = (destinations: BroadcastDestinationPublic[]) => void;

const byId = new Map<string, BroadcastDestinationPublic>();
const listeners = new Set<Listener>();

function emit(): void {
  const list = Array.from(byId.values());
  for (const l of listeners) l(list);
}

function seedDefaults(userId: string): void {
  for (const p of CANONICAL_BEZEL_PROVIDERS) {
    const id = destinationIdFor(userId || "anon", p.provider);
    if (byId.has(id)) continue;
    byId.set(id, {
      destinationId: id,
      provider: p.provider,
      label: p.label,
      shortCode: p.shortCode,
      connectionStatus: "off",
      authState: "unlinked",
      ingestType: "rtmp",
      enabled: false,
      health: "unknown",
      retryState: { attempts: 0, nextRetryAt: null },
      latencyMs: null,
      statusLine: "Not linked",
    });
  }
}

export function ensureBroadcastDestinationSeed(userId?: string | null): void {
  seedDefaults(userId?.trim() || "anon");
  emit();
}

export function upsertBroadcastDestination(dest: BroadcastDestinationPublic): void {
  byId.set(dest.destinationId, dest);
  emit();
}

export function replaceBroadcastDestinations(list: BroadcastDestinationPublic[]): void {
  byId.clear();
  for (const d of list) byId.set(d.destinationId, d);
  emit();
}

export function getBroadcastDestinations(): BroadcastDestinationPublic[] {
  return Array.from(byId.values());
}

export function getBroadcastDestination(id: string): BroadcastDestinationPublic | undefined {
  return byId.get(id);
}

export function getBroadcastDestinationByProvider(
  provider: BroadcastProvider,
): BroadcastDestinationPublic | undefined {
  return Array.from(byId.values()).find((d) => d.provider === provider);
}

export function patchBroadcastDestination(
  destinationId: string,
  patch: Partial<BroadcastDestinationPublic>,
): BroadcastDestinationPublic | null {
  const cur = byId.get(destinationId);
  if (!cur) return null;
  const next = { ...cur, ...patch, destinationId: cur.destinationId, provider: cur.provider };
  byId.set(destinationId, next);
  emit();
  return next;
}

export function setDestinationConnectionStatus(
  destinationId: string,
  connectionStatus: DestinationConnectionStatus,
  statusLine?: string,
): void {
  patchBroadcastDestination(destinationId, {
    connectionStatus,
    ...(statusLine !== undefined ? { statusLine } : {}),
    health:
      connectionStatus === "live"
        ? "ok"
        : connectionStatus === "error"
          ? "down"
          : connectionStatus === "connecting" || connectionStatus === "retry"
            ? "degraded"
            : "unknown",
  });
}

export function subscribeBroadcastDestinations(listener: Listener): () => void {
  listeners.add(listener);
  listener(getBroadcastDestinations());
  return () => {
    listeners.delete(listener);
  };
}
