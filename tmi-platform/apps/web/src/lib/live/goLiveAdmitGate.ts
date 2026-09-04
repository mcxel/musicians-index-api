/**
 * Go Live admit gate — persistent Command Center / hub environment.
 * Allows legitimate creator broadcast; blocks unauthenticated & fan-as-public-stage.
 * Complements Security Stability (workspace) — does not resolve ?workspace=.
 */

export type GoLiveAdmitRole =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "ARTIST"
  | "PRODUCER"
  | "ADMIN"
  | "SUPERADMIN"
  | "VENUE"
  | "PROMOTER"
  | "SPONSOR"
  | "ADVERTISER"
  | "WRITER"
  | "STAFF"
  | "UNKNOWN";

export type GoLiveAdmitDecision =
  | { allowed: true; mode: "public_stage" | "fan_lobby" | "private_stage" }
  | { allowed: false; status: 401 | 403; reason: string; code: string };

const PUBLIC_STAGE_ROLES = new Set([
  "PERFORMER",
  "BAND",
  "ARTIST",
  "PRODUCER",
  "ADMIN",
  "SUPERADMIN",
  "VENUE",
  "STAFF",
]);

export function normalizeGoLiveAdmitRole(role: string | null | undefined): GoLiveAdmitRole {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "UNKNOWN";
  if (r === "MEMBER" || r === "USER") return "FAN";
  if (
    r === "FAN" ||
    r === "PERFORMER" ||
    r === "BAND" ||
    r === "ARTIST" ||
    r === "PRODUCER" ||
    r === "ADMIN" ||
    r === "SUPERADMIN" ||
    r === "VENUE" ||
    r === "PROMOTER" ||
    r === "SPONSOR" ||
    r === "ADVERTISER" ||
    r === "WRITER" ||
    r === "STAFF"
  ) {
    return r;
  }
  return "UNKNOWN";
}

/**
 * Server/client admit for POST /api/live/go and in-place hub GO LIVE.
 * @param authenticated — session present
 * @param role — primary account role (PRODUCER specialty maps via normalize)
 * @param privacy — public | private | friends | invite
 * @param listed — whether session will appear on lobby walls
 */
export function admitGoLive(input: {
  authenticated: boolean;
  role?: string | null;
  privacy?: string | null;
  listed?: boolean;
}): GoLiveAdmitDecision {
  if (!input.authenticated) {
    return {
      allowed: false,
      status: 401,
      reason: "Authentication required to go live.",
      code: "auth_required",
    };
  }

  const role = normalizeGoLiveAdmitRole(input.role);
  const privacy = String(input.privacy ?? "public").toLowerCase();
  const restricted = privacy === "private" || privacy === "friends" || privacy === "invite";
  const listed = input.listed !== false && !restricted;

  if (role === "UNKNOWN") {
    return {
      allowed: false,
      status: 403,
      reason: "Role unresolved — cannot admit go-live until session role is known.",
      code: "role_unresolved",
    };
  }

  if (PUBLIC_STAGE_ROLES.has(role)) {
    return {
      allowed: true,
      mode: restricted ? "private_stage" : "public_stage",
    };
  }

  // Fans: lobby / private only — never public performer stage listing
  if (role === "FAN") {
    if (listed && !restricted) {
      return {
        allowed: true,
        mode: "fan_lobby",
      };
    }
    return { allowed: true, mode: "fan_lobby" };
  }

  // Partner roles (sponsor/advertiser/promoter/writer) — private/rehearsal only
  if (listed && !restricted) {
    return {
      allowed: false,
      status: 403,
      reason: `${role} cannot open a public stage broadcast. Use private rehearsal or a creator account.`,
      code: "role_public_stage_denied",
    };
  }

  return { allowed: true, mode: "private_stage" };
}

/** True when this role may mint a Daily/server-kit room for public stage. */
export function mayMintServerKitRoom(role: string | null | undefined): boolean {
  const r = normalizeGoLiveAdmitRole(role);
  return PUBLIC_STAGE_ROLES.has(r);
}
