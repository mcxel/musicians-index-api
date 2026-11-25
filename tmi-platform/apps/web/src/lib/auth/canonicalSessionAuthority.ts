/**
 * A valid tmi_uid_sig cookie proves only that TMI previously issued it.
 * Current authentication and role come from a successful canonical User read.
 * A missing row and a failed lookup are different closed outcomes. Neither
 * one may promote cookie role claims into an authorized session.
 */

export type CanonicalSessionLookup = "absent" | "error" | "found";

export type CanonicalSessionUser = {
  id: string;
  email: string;
  role: string;
  activeRole: string | null;
  tier: string;
  name: string | null;
  isLive: boolean;
  liveRoomId: string | null;
  onboardingState: string;
  userRef: string | null;
  artistSlug: string | null;
  age: number | null;
  dateOfBirth: Date | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  billingStatus: string | null;
  emailVerified?: Date | null;
};

export type CanonicalSessionDecision =
  | { outcome: "unauthenticated"; reason: "missing_cookie" | "user_absent" }
  | { outcome: "unavailable"; reason: "lookup_failed" }
  | { outcome: "authenticated"; user: CanonicalSessionUser };

const ADMIN_SHELL_ROLES = new Set(["ADMIN", "STAFF", "SUPERADMIN"]);

export function decideCanonicalSession(input: {
  verifiedUserId: string | null;
  lookup: CanonicalSessionLookup;
  dbUser: CanonicalSessionUser | null;
  /** Present only so tests can prove it cannot grant authority. */
  cookieRole?: string | null;
}): CanonicalSessionDecision {
  void input.cookieRole;
  if (!input.verifiedUserId) {
    return { outcome: "unauthenticated", reason: "missing_cookie" };
  }
  if (input.lookup === "error") {
    return { outcome: "unavailable", reason: "lookup_failed" };
  }
  if (input.lookup !== "found" || !input.dbUser || input.dbUser.id !== input.verifiedUserId) {
    return { outcome: "unauthenticated", reason: "user_absent" };
  }
  return {
    outcome: "authenticated",
    user: {
      ...input.dbUser,
      role: String(input.dbUser.role || "USER").toUpperCase(),
      activeRole: input.dbUser.activeRole
        ? String(input.dbUser.activeRole).toUpperCase()
        : null,
    },
  };
}

export function protectedAdminAllowed(decision: CanonicalSessionDecision): boolean {
  if (decision.outcome !== "authenticated") return false;
  return ADMIN_SHELL_ROLES.has(decision.user.role);
}

export function personaSwitchMutationAllowed(decision: CanonicalSessionDecision): boolean {
  return decision.outcome === "authenticated";
}

const PERFORMER_HUB_ROLES = new Set(["PERFORMER", "ARTIST", "BAND", "PRODUCER"]);
const FAN_HUB_ROLES = new Set(["FAN", "USER", "MEMBER"]);

export type HubWorkspace = "fan" | "performer";

export type HubWorkspaceAccess =
  | {
      allowed: true;
      identity: "FAN" | "PERFORMER";
      role: string;
      userId: string;
      name: string | null;
      email: string;
    }
  | { allowed: false; reason: "unauthenticated" | "unavailable" | "role_denied" | "onboarding_required" };

function personaAuthorizes(persona: string | null, workspace: HubWorkspace): boolean {
  const role = (persona ?? "").toUpperCase();
  if (workspace === "performer") return PERFORMER_HUB_ROLES.has(role);
  return FAN_HUB_ROLES.has(role);
}

/**
 * Cookie role and hub-shell claims cannot grant a workspace.
 * A canonical admin may still open the fan or performer shell their
 * oversight switch selected. Every other account follows the current
 * database persona (activeRole when set, otherwise role).
 */
export function decideHubWorkspaceAccess(input: {
  decision: CanonicalSessionDecision;
  workspace: HubWorkspace;
  hubShell?: string | null;
  cookieRole?: string | null;
}): HubWorkspaceAccess {
  void input.cookieRole;
  if (input.decision.outcome === "unavailable") {
    return { allowed: false, reason: "unavailable" };
  }
  if (input.decision.outcome !== "authenticated") {
    return { allowed: false, reason: "unauthenticated" };
  }
  const user = input.decision.user;
  const shell = (input.hubShell ?? "").trim().toLowerCase();
  const adminOversight = ADMIN_SHELL_ROLES.has(user.role) && shell === input.workspace;
  const persona = user.activeRole ?? user.role;
  if (!adminOversight && !personaAuthorizes(persona, input.workspace)) {
    return { allowed: false, reason: "role_denied" };
  }
  // P0 Anti-Flicker Gate: fresh/incomplete accounts must never mount Hub shell before onboarding
  if (!adminOversight && (user.onboardingState ?? "").toUpperCase() !== "COMPLETE") {
    return { allowed: false, reason: "onboarding_required" };
  }
  return {
    allowed: true,
    identity: input.workspace === "fan" ? "FAN" : "PERFORMER",
    role: user.role,
    userId: user.id,
    name: user.name,
    email: user.email,
  };
}

export function canonicalWorkspacePath(
  user: CanonicalSessionUser,
  hubShell?: string | null,
): string {
  // P0 Gate: Incomplete onboarding resolves server-side to role-specific onboarding
  if ((user.onboardingState ?? "").toUpperCase() !== "COMPLETE") {
    const persona = user.activeRole ?? user.role;
    const role = (persona ?? "").toUpperCase();
    if (PERFORMER_HUB_ROLES.has(role)) return "/onboarding/performer";
    if (role === "WRITER") return "/onboarding/writer";
    if (role === "VENUE") return "/onboarding/venue";
    if (role === "PROMOTER") return "/onboarding/promoter";
    if (role === "SPONSOR") return "/onboarding/sponsor";
    if (role === "ADVERTISER") return "/onboarding/advertiser";
    return "/onboarding/fan";
  }

  const shell = (hubShell ?? "").trim().toLowerCase();
  if (ADMIN_SHELL_ROLES.has(user.role) && shell === "fan") return "/hub/fan";
  if (ADMIN_SHELL_ROLES.has(user.role) && shell === "performer") return "/hub/performer";
  const persona = user.activeRole ?? user.role;
  const role = persona.toUpperCase();
  if (PERFORMER_HUB_ROLES.has(role)) return "/hub/performer";
  if (FAN_HUB_ROLES.has(role)) return "/hub/fan";
  if (role === "WRITER") return "/hub/writer";
  if (role === "VENUE") return "/hub/venue";
  if (role === "PROMOTER") return "/hub/promoter";
  if (role === "SPONSOR") return "/hub/sponsor";
  if (role === "ADVERTISER") return "/hub/advertiser";
  if (ADMIN_SHELL_ROLES.has(role)) return "/admin";
  return "/hub";
}
