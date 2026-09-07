/**
 * BroadcastCapabilityResolver.ts
 *
 * Canonical capability authority for external live broadcast distribution rail.
 *
 * Product Laws:
 * 1. FAN + no broadcast capability -> NO destination rail.
 * 2. PERFORMER + authorized broadcast capability -> Destination rail rendered.
 * 3. FAN + explicitly authorized broadcaster session -> Destination rail only if session has explicit capability.
 * 4. Profile ownership alone -> NEVER enough (activeRole and activeSession truth govern).
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
}

/**
 * Resolves whether the external live distribution bezel / destination rail should be visible and active.
 */
export function canBroadcastExternalDestinations(ctx: BroadcastCapabilityContext): boolean {
  const role = (ctx.activeRole || "").toUpperCase();

  // Role check: Performer personas with active broadcaster role
  const isBroadcasterRole = ["PERFORMER", "ARTIST", "BAND", "PRODUCER"].includes(role);
  if (isBroadcasterRole) {
    return true;
  }

  // Explicit capability override on active session (e.g. authorized co-broadcaster)
  if (ctx.canBroadcastOverride === true) {
    return true;
  }

  // Live session host who is not an ordinary spectator fan
  if (ctx.isLiveSessionOwner && role !== "FAN" && role !== "USER") {
    return true;
  }

  // Law: Active Fan mode without explicit broadcaster capability NEVER receives destination controls
  return false;
}
