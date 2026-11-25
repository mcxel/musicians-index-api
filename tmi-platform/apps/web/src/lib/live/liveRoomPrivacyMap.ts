/**
 * Client-safe live privacy mappers — NO Prisma / pg / Node-only imports.
 * Server ticket/friendship checks stay in liveRoomPrivacyGate.ts.
 */

import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import type { LiveSession } from "@/lib/broadcast/globalLiveSessionStore";

export type RegistryLivePrivacy = LiveSession["privacy"];

export type LiveRoomJoinDecision = {
  allowed: boolean;
  reason: string;
  privacy: LivePrivacy;
  registryPrivacy: RegistryLivePrivacy;
};

/**
 * Resolve join privacy from a registry session.
 * Prefer stored `audiencePrivacyMode` (fine-grained). Never invent "friends"
 * from INVITE_ONLY alone — without mode detail, fail closed as private.
 */
export function resolveAudiencePrivacyFromSession(session: {
  privacy?: RegistryLivePrivacy | string | null;
  audiencePrivacyMode?: LivePrivacy | string | null;
} | null | undefined): LivePrivacy {
  if (!session) return "public";
  if (session.audiencePrivacyMode != null && String(session.audiencePrivacyMode).trim() !== "") {
    return normalizeLivePrivacyMode(String(session.audiencePrivacyMode));
  }
  const reg = String(session.privacy ?? "PUBLIC").toUpperCase();
  if (reg === "PUBLIC") return "public";
  // SECURITY NOTE (2026-09-23): this collapses PAID_ENTRY to "public" for the
  // friends/invite/private mode this function's callers actually branch on —
  // it is NOT a statement that a paid room is open access. Real ticket
  // ownership is a separate, mandatory check — see hasValidTicketForRoom
  // in liveRoomPrivacyGate.ts.
  if (reg === "PAID_ENTRY") return "public";
  // INVITE_ONLY without fine-grained mode → private (host-only). Honest deny > fake friends pass.
  return "private";
}

/** Map dock/UI privacy onto GlobalLiveSessionRegistry privacy enum. */
export function mapLivePrivacyToRegistry(privacy: LivePrivacy | string | undefined | null): RegistryLivePrivacy {
  const raw = String(privacy ?? "public").trim();
  const upper = raw.toUpperCase();
  if (upper === "PAID_ENTRY" || upper === "PAID") return "PAID_ENTRY";
  if (
    upper === "INVITE_ONLY" ||
    upper === "INVITE" ||
    upper === "PRIVATE" ||
    upper === "FRIENDS" ||
    upper === "FRIENDS_ONLY"
  ) {
    return "INVITE_ONLY";
  }
  if (upper === "PUBLIC") return "PUBLIC";

  const lower = raw.toLowerCase();
  if (lower === "friends" || lower === "invite" || lower === "private") return "INVITE_ONLY";
  return "PUBLIC";
}

export function normalizeLivePrivacyMode(raw: string | undefined | null): LivePrivacy {
  const v = String(raw ?? "public").toLowerCase().trim();
  if (v === "friends" || v === "invite" || v === "private" || v === "public") return v;
  if (v === "invite_only" || v === "friends_only") return v.startsWith("friend") ? "friends" : "invite";
  return "public";
}
