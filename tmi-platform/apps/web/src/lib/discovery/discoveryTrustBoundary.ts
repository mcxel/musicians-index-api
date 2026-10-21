/**
 * Discovery trust-boundary helpers — sole writer semantics live in DiscoveryPublisher.
 * Mosaic consumes stamped LiveDiscoveryRecord fields; never invents HEALTHY/bot flags.
 */

import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";

export function mapStreamHealthToTransportHealth(
  health: string | null | undefined,
): LiveDiscoveryRecord["transportHealth"] {
  const h = String(health ?? "unknown").toLowerCase();
  if (h === "excellent" || h === "good") return "HEALTHY";
  if (h === "degraded") return "DEGRADED";
  if (h === "critical") return "UNHEALTHY";
  return "UNKNOWN";
}

export function isTransportEligibleForMosaic(
  health: LiveDiscoveryRecord["transportHealth"],
): boolean {
  return health === "HEALTHY" || health === "DEGRADED" || health === "UNKNOWN";
}

export type DiscoveryTrustStampInput = {
  isBotOnly?: boolean;
  isTest?: boolean;
  isRehearsal?: boolean;
  isLocalPreview?: boolean;
  isAdminOnly?: boolean;
  transportHealth?: LiveDiscoveryRecord["transportHealth"];
  requiresPaidEntry?: boolean;
  category?: string;
  visibilityRaw?: string;
  entryPriceUsd?: number | null;
  joinGate?: LiveDiscoveryRecord["joinGate"];
  hostUserId?: string;
  roomId?: string;
  title?: string;
};

export function stampDiscoveryTrust(input: DiscoveryTrustStampInput): {
  isBotOnly: boolean;
  isTest: boolean;
  isRehearsal: boolean;
  isLocalPreview: boolean;
  isAdminOnly: boolean;
  transportHealth: LiveDiscoveryRecord["transportHealth"];
  requiresPaidEntry: boolean;
  trustProvenance: "DiscoveryPublisher";
} {
  const hostId = input.hostUserId ?? "";
  const isBotHost =
    input.isBotOnly === true ||
    hostId.startsWith("bot-") ||
    hostId.startsWith("tmi-bot") ||
    hostId.startsWith("system-host");

  const catLower = String(input.category ?? "").toLowerCase();
  const visRaw = String(input.visibilityRaw ?? "").toLowerCase();
  const isPaidVis = visRaw === "paid_entry" || visRaw === "paid-entry";

  const requiresPaidEntry =
    input.requiresPaidEntry === true ||
    isPaidVis ||
    (typeof input.entryPriceUsd === "number" && input.entryPriceUsd > 0) ||
    input.joinGate === "paid";

  const isTest =
    input.isTest === true ||
    Boolean(input.roomId?.includes("test")) ||
    Boolean(input.title?.toLowerCase().includes("[test]"));

  const isRehearsal =
    input.isRehearsal === true || catLower === "rehearsal" || catLower.includes("rehearsal");

  return {
    isBotOnly: isBotHost,
    isTest,
    isRehearsal,
    isLocalPreview: input.isLocalPreview === true,
    isAdminOnly: input.isAdminOnly === true,
    transportHealth: input.transportHealth ?? "UNKNOWN",
    requiresPaidEntry,
    trustProvenance: "DiscoveryPublisher",
  };
}

export function humanViewerCountAuthorityNote(): string {
  return "LiveDiscoveryRecord.humanViewerCount originates from DiscoveryPublisher (session.viewerCount / presence.fanCount). BotCrowdFill must never be passed as humanViewerCount.";
}