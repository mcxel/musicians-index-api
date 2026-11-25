/**
 * BroadcastCapabilityResolver.ts
 *
 * Canonical capability authority for external live broadcast distribution rail.
 *
 * Product Laws:
 * 1. FAN + no broadcast capability -> NO destination rail.
 * 2. PERFORMER + authorized broadcast capability -> Destination rail rendered.
 * 3. Operator / Admin capability -> Destination rail rendered across all hubs.
 * 4. Diamond entitlement alone without broadcast authority / session ownership -> DENIED.
 * 5. Authenticated session ownership + broadcast authority -> Destination rail rendered.
 * 6. Explicit capability override on active session -> Destination rail rendered.
 * 7. Profile ownership alone -> NEVER enough (activeRole and activeSession truth govern).
 */

export interface BroadcastCapabilityContext {
  /** Current active role context in the session */
  activeRole: string;
  /** Whether the user is the authoritative owner/operator of the current live room */
  isLiveSessionOwner?: boolean;
  /** Explicit capability override granted to this session (e.g. verified co-host / guest broadcast rights) */
  canBroadcastOverride?: boolean;
  /** Specific broadcast-level entitlements attached to the active session */
  entitlements?: string[];
  /** User tier entitlement (e.g. FREE, SILVER, GOLD, PLATINUM, DIAMOND) */
  tier?: string | null;
  /** Operator or Admin capability flags */
  isOperator?: boolean;
  isAdmin?: boolean;
  /** Room or broadcast authority status */
  hasBroadcastAuthority?: boolean;
  /** Additional session capabilities or roles from canonical auth */
  accountRoles?: string[];
}

/**
 * Resolves whether the external live distribution bezel / destination rail should be visible and active.
 */
export function canBroadcastExternalDestinations(ctx: BroadcastCapabilityContext): boolean {
  const role = (ctx.activeRole || "").toUpperCase();
  const tier = (ctx.tier || "").toUpperCase();

  // 1. Explicit capability override on active session (e.g. authorized co-broadcaster)
  if (ctx.canBroadcastOverride === true) {
    return true;
  }

  // 2. Explicit broadcast entitlement grants capability
  if (ctx.entitlements?.some((e) => e === "broadcast.external_destinations" || e === "broadcasting")) {
    return true;
  }

  // 3. Operator or Admin capability: administrative authority governs across all views/hubs
  const isOperatorOrAdminRole = ["OPERATOR", "ADMIN", "STAFF", "SUPERADMIN"].includes(role);
  const hasOperatorOrAdminFlag = ctx.isOperator === true || ctx.isAdmin === true;
  const hasOperatorOrAdminAccountRole = ctx.accountRoles?.some((r) =>
    ["OPERATOR", "ADMIN", "STAFF", "SUPERADMIN"].includes(r.toUpperCase())
  );
  if (isOperatorOrAdminRole || hasOperatorOrAdminFlag || hasOperatorOrAdminAccountRole) {
    return true;
  }

  // 4. Role check: Performer personas with active broadcaster role
  const isBroadcasterRole = ["PERFORMER", "ARTIST", "BAND", "PRODUCER", "CREATOR", "VENUE"].includes(role);
  if (isBroadcasterRole) {
    return true;
  }

  // 5. Live session owner who has legitimate room/broadcast authority
  if (
    ctx.isLiveSessionOwner &&
    (ctx.hasBroadcastAuthority || tier === "DIAMOND" || (role !== "FAN" && role !== "USER"))
  ) {
    return true;
  }

  // 6. Law: Active Fan mode and unauthorized Diamond alone without explicit broadcaster capability NEVER receives destination controls
  return false;
}
