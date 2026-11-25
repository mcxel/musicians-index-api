/**
 * Foundry Access Policy — private manufacturing authority only.
 *
 * Authorized:
 *   - Owner (Marcel / berntmusic33)
 *   - Michael Charlie via explicitly authorized identity
 *   - Additional operators listed in FOUNDRY_APPROVED_OPERATOR_KEYS
 *
 * NOT automatic:
 *   - All ADMIN / STAFF accounts
 *   - Big Ace (admin responsibilities ≠ Foundry manufacturing)
 *   - Fans / Performers / Business roles
 *
 * Admin layout still requires ADMIN|STAFF to reach /admin/*; this policy is the
 * second gate for Foundry pages, APIs, jobs, and gateway writes.
 */

export type FoundryAccessDecision =
  | { allowed: true; actorKey: FoundryActorKey; reason: string }
  | { allowed: false; actorKey: FoundryActorKey | "unknown" | "big-ace"; reason: string };

export type FoundryActorKey =
  | "owner"
  | "michael-charlie"
  | "approved-operator"
  | "forge-service";

/** Explicit allowlist — expand only with owner approval. */
export const FOUNDRY_OWNER_EMAILS = new Set([
  "berntmusic33@gmail.com",
]);

export const FOUNDRY_OWNER_IDENTITY_MARKERS = [
  "marcel",
  "berntmusic33",
  "marcel dickens",
] as const;

export const FOUNDRY_MICHAEL_CHARLIE_IDENTITY_MARKERS = [
  "michael charlie",
  "michael-charlie",
  "michaelcharlie",
  "mc michael charlie",
] as const;

/** Additional humans approved by owner for Foundry manufacturing. Empty until named. */
export const FOUNDRY_APPROVED_OPERATOR_KEYS = new Set<string>([]);

export const FOUNDRY_AGENT_IDS = {
  CURSOR: "cursor",
  ANTI_GRAVITY: "anti-gravity",
  CLAUDE: "claude",
  FORGE: "tmi-foundry-forge",
  FORGE_BUILDER: "forge-builder",
  FORGE_TESTER: "forge-tester",
  FORGE_LOGISTICS: "forge-logistics",
  /** Logistics specializations — under FORGE_LOGISTICS, not competing engines. */
  FORGE_SHIPPER: "forge-shipper",
  FORGE_RECEIVER: "forge-receiver",
  FORGE_DELEGATOR: "forge-delegator",
  MICHAEL_CHARLIE: "michael-charlie",
} as const;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function includesAny(hay: string, needles: readonly string[]): boolean {
  return needles.some((n) => hay.includes(n));
}

/**
 * Resolve whether a human session may open Foundry manufacturing surfaces.
 * Big Ace is explicitly denied even when ADMIN.
 */
export function resolveFoundryHumanAccess(input: {
  email?: string | null;
  displayName?: string | null;
  role?: string | null;
  userId?: string | null;
}): FoundryAccessDecision {
  const email = norm(input.email ?? "");
  const name = norm(input.displayName ?? "");
  const role = (input.role ?? "").toUpperCase();
  const blob = `${email} ${name} ${input.userId ?? ""}`;

  if (includesAny(blob, ["big ace", "big-ace", "bigace"]) && !FOUNDRY_OWNER_EMAILS.has(email)) {
    return {
      allowed: false,
      actorKey: "big-ace",
      reason: "Big Ace does not automatically receive Foundry manufacturing access",
    };
  }

  if (FOUNDRY_OWNER_EMAILS.has(email) || includesAny(blob, FOUNDRY_OWNER_IDENTITY_MARKERS)) {
    return { allowed: true, actorKey: "owner", reason: "Owner Foundry authority" };
  }

  if (includesAny(blob, FOUNDRY_MICHAEL_CHARLIE_IDENTITY_MARKERS)) {
    if (role === "ADMIN" || role === "STAFF") {
      return {
        allowed: true,
        actorKey: "michael-charlie",
        reason: "Michael Charlie authorized Foundry identity",
      };
    }
    return {
      allowed: false,
      actorKey: "michael-charlie",
      reason: "Michael Charlie identity recognized but ADMIN/STAFF role required for Foundry UI",
    };
  }

  const operatorKey = email || name || (input.userId ?? "");
  if (operatorKey && FOUNDRY_APPROVED_OPERATOR_KEYS.has(operatorKey)) {
    return {
      allowed: true,
      actorKey: "approved-operator",
      reason: "Explicitly owner-approved Foundry operator",
    };
  }

  return {
    allowed: false,
    actorKey: "unknown",
    reason: "Foundry access requires Owner, authorized Michael Charlie, or an owner-approved operator",
  };
}

/**
 * Development / Forge service agents — capability-scoped, never full owner.
 * Registration alone does not grant publish/live-switch.
 */
export function resolveFoundryAgentAccess(input: {
  agentId: string;
  capabilities?: readonly string[];
}): FoundryAccessDecision {
  const id = norm(input.agentId);
  const caps = new Set((input.capabilities ?? []).map(norm));

  if (id === FOUNDRY_AGENT_IDS.FORGE || id.startsWith("forge-")) {
    return { allowed: true, actorKey: "forge-service", reason: "Forge service agent" };
  }

  if (
    id === FOUNDRY_AGENT_IDS.CURSOR ||
    id === FOUNDRY_AGENT_IDS.ANTI_GRAVITY ||
    id === FOUNDRY_AGENT_IDS.CLAUDE
  ) {
    if (caps.has("foundry.submit") || caps.has("foundry.collaborate") || caps.size === 0) {
      // Empty caps = discover-only until capability registered; allow read+submit staging.
      return {
        allowed: true,
        actorKey: "approved-operator",
        reason: `Development agent ${id} via Universal Collaboration Gateway`,
      };
    }
  }

  if (id === FOUNDRY_AGENT_IDS.MICHAEL_CHARLIE) {
    return {
      allowed: true,
      actorKey: "michael-charlie",
      reason: "Michael Charlie commercial collaborator (scoped)",
    };
  }

  return {
    allowed: false,
    actorKey: "unknown",
    reason: `Agent '${input.agentId}' is not authorized for Foundry gateway`,
  };
}

export const FOUNDRY_RELEASE_LOCKS = {
  SAFE_TO_PUSH: false,
  COMMIT: false,
  PUSH: false,
  MERGE: false,
  DEPLOY: false,
  PRODUCTION_DB_MUTATIONS: false,
  STRIPE_MUTATIONS: false,
  LIVE_ASSET_SWITCHES: false,
  PHYSICAL_VERIFIED: false,
  OWNER_RELEASE_APPROVAL: "WAITING",
} as const;
