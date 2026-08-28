/**
 * Profile Media Player API — security helpers (Slice B).
 * Testable without Next.js request mocks.
 */

export type ProfileMediaPlayerCommand = "EQUIP_ACTIVE" | "EQUIP_PROFILE" | "FOLLOW_ACTIVE";

const PERFORMER_ROLES = new Set(["PERFORMER", "ARTIST", "BAND"]);
const BAND_ROLES = new Set(["BAND"]);

export function canMutateProfileMediaPlayer(input: {
  sessionUserId: string;
  sessionRole: string;
  targetOwnerUserId: string;
  bandMemberUserIds?: string[];
}): boolean {
  if (!input.sessionUserId || !input.targetOwnerUserId) return false;
  if (input.sessionUserId === input.targetOwnerUserId) return true;
  if (BAND_ROLES.has(input.sessionRole.toUpperCase())) {
    return (input.bandMemberUserIds ?? []).includes(input.targetOwnerUserId);
  }
  return false;
}

export function canViewPublicProfileMediaPlayer(_viewerUserId: string | null): boolean {
  return true;
}

export function authorizeProfileMediaPlayerPost(input: {
  sessionUserId: string | null;
  sessionRole: string | null;
  bodyOwnerUserId?: string | null;
  bodyPerformerId?: string | null;
  bandMemberUserIds?: string[];
}): { ok: true; ownerUserId: string } | { ok: false; status: 401 | 403; error: string } {
  if (!input.sessionUserId) {
    return { ok: false, status: 401, error: "Sign in required." };
  }

  const hintedOwner = (input.bodyOwnerUserId ?? input.bodyPerformerId ?? "").trim();
  const ownerUserId = hintedOwner || input.sessionUserId;

  if (hintedOwner && hintedOwner !== input.sessionUserId) {
    const allowed = canMutateProfileMediaPlayer({
      sessionUserId: input.sessionUserId,
      sessionRole: input.sessionRole ?? "FAN",
      targetOwnerUserId: ownerUserId,
      bandMemberUserIds: input.bandMemberUserIds,
    });
    if (!allowed) {
      return {
        ok: false,
        status: 403,
        error: "Forbidden — cannot change another performer's media player.",
      };
    }
  }

  const role = (input.sessionRole ?? "FAN").toUpperCase();
  if (!PERFORMER_ROLES.has(role) && ownerUserId === input.sessionUserId) {
    return {
      ok: false,
      status: 403,
      error: "Profile media player equip is for performer and band accounts only.",
    };
  }

  return { ok: true, ownerUserId };
}

export function parseProfileMediaPlayerCommand(raw: unknown): ProfileMediaPlayerCommand | null {
  const cmd = String(raw ?? "").toUpperCase();
  if (cmd === "EQUIP_ACTIVE" || cmd === "EQUIP_PROFILE" || cmd === "FOLLOW_ACTIVE") {
    return cmd;
  }
  return null;
}

export function isProductionCertifiedFamily(status: "STUB" | "CERTIFIED"): boolean {
  return status === "CERTIFIED";
}
