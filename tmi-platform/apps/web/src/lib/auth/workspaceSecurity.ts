/**
 * Workspace security — Priority 1 Security Stability slices.
 *
 * Slice A: Never resolve partner/admin workspace identity from ?workspace=.
 * Slice B: Partner workspace switcher off for normal admin; governance override
 *          is a separate audited path.
 */

export type OverseerWorkspaceRole = "marcel" | "justin" | "jaypaul";

/** Real admin emails → overseer workspace (session membership only). */
export const EMAIL_TO_WORKSPACE_ROLE: Record<string, OverseerWorkspaceRole> = {
  "berntmusic33@gmail.com": "marcel",
  "justin@themusiciansindex.com": "justin",
  "rjking42@icloud.com": "justin",
  "jay@themusiciansindex.com": "jaypaul",
  "bjmtherapper1@gmail.com": "jaypaul",
};

export type WorkspaceResolveResult =
  | { ok: true; role: OverseerWorkspaceRole; source: "session_membership" }
  | { ok: false; status: 403; reason: string };

export type GovernanceWorkspaceOverride = {
  enabled: boolean;
  actorEmail: string;
  reason: string;
  at: number;
};

const governanceOverrideAudit: GovernanceWorkspaceOverride[] = [];

/**
 * Resolve overseer workspace strictly from authenticated email membership.
 * URL/query workspace parameters are intentionally ignored.
 */
export function resolveWorkspaceFromSession(input: {
  email?: string | null;
  /** Rejected — never trusted for workspace identity. */
  workspaceQuery?: string | null;
}): WorkspaceResolveResult {
  if (input.workspaceQuery != null && String(input.workspaceQuery).trim() !== "") {
    // Explicitly ignore; do not map. Callers must not pass this as authority.
  }

  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) {
    return {
      ok: false,
      status: 403,
      reason: "Unauthenticated — workspace requires an authenticated session.",
    };
  }

  const role = EMAIL_TO_WORKSPACE_ROLE[email];
  if (!role) {
    return {
      ok: false,
      status: 403,
      reason: "Forbidden — session is not an authorized overseer workspace member.",
    };
  }

  return { ok: true, role, source: "session_membership" };
}

/** Partner workspace pills stay off unless a governance override is recorded. */
export function partnerWorkspaceSwitcherAllowed(opts?: {
  governanceOverride?: boolean;
  actorEmail?: string;
  reason?: string;
}): boolean {
  if (!opts?.governanceOverride) return false;
  const actorEmail = (opts.actorEmail ?? "").trim().toLowerCase();
  if (!actorEmail || !EMAIL_TO_WORKSPACE_ROLE[actorEmail]) return false;
  governanceOverrideAudit.unshift({
    enabled: true,
    actorEmail,
    reason: opts.reason?.trim() || "governance_workspace_override",
    at: Date.now(),
  });
  if (governanceOverrideAudit.length > 200) governanceOverrideAudit.length = 200;
  return true;
}

export function getGovernanceWorkspaceOverrideAudit(limit = 20): GovernanceWorkspaceOverride[] {
  return governanceOverrideAudit.slice(0, limit);
}

/** Certification predicates — Slice A + Slice B. */
export function securityStabilitySliceA_noQueryWorkspaceAuth(): boolean {
  const spoof = resolveWorkspaceFromSession({
    email: null,
    workspaceQuery: "marcel",
  });
  const member = resolveWorkspaceFromSession({
    email: "berntmusic33@gmail.com",
    workspaceQuery: "justin",
  });
  return (
    spoof.ok === false &&
    spoof.status === 403 &&
    member.ok === true &&
    member.role === "marcel" &&
    member.source === "session_membership"
  );
}

export function securityStabilitySliceB_partnerSwitcherOffByDefault(): boolean {
  const normal = partnerWorkspaceSwitcherAllowed();
  const forged = partnerWorkspaceSwitcherAllowed({
    governanceOverride: true,
    actorEmail: "random@example.com",
    reason: "forged",
  });
  const governed = partnerWorkspaceSwitcherAllowed({
    governanceOverride: true,
    actorEmail: "berntmusic33@gmail.com",
    reason: "explicit_governance_override_test",
  });
  const audit = getGovernanceWorkspaceOverrideAudit(5);
  return (
    normal === false &&
    forged === false &&
    governed === true &&
    audit.some((e) => e.reason === "explicit_governance_override_test")
  );
}
