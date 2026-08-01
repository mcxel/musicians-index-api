/**
 * livingOsCommandBus — Living OS Command Bus (locked 2026-08-01).
 *
 * Single execution pathway for all user-initiated actions:
 *   UI → Command Bus → Runtime → Canonical Data → Observatory
 *
 * Every command moves through the canonical lifecycle:
 *   1. Receive    — accept the command
 *   2. Validate   — check required fields
 *   3. Authorize  — role/permission gate (enforced by caller for now; bus logs violations)
 *   4. Execute    — route to runtime handler
 *   5. Record     — emit Observatory telemetry via PersonaAnalyticsEngine
 *   6. Notify     — fire registered listeners
 *   7. Observe    — return the emitted event for tracing
 *
 * Engineering guardrails:
 *   - Idempotent dispatch: commands with the same idempotencyKey are deduped within 2s
 *   - Observable: every command emits to PersonaAnalyticsEngine
 *   - Recoverable: dispatch() never throws — errors are returned in the result
 *   - Authorized: role is stamped on every command; violations are logged
 *   - Versioned: schemaVersion field allows future evolution
 *
 * Usage:
 *   livingOsCommandBus.dispatch({ type: 'DRAWER_OPENED', category: 'navigation',
 *     payload: { panelId: 'analytics', role: 'performer' }, userId });
 *
 * Preferred usage (via Action Registry):
 *   livingOsCommandBus.executeAction('ACTION_VIEW_ANALYTICS',
 *     { userId, role: 'performer', payload: { panelId: 'analytics' } });
 */

import { emitEvent } from "@/lib/analytics/PersonaAnalyticsEngine";
import { getAction, type ActionId } from "@/lib/os/universalActionRegistry";
import { canExecute, getDenialReason, type PlatformRole } from "@/lib/os/universalPermissionRegistry";

// ─── Command Categories (Living OS spec) ─────────────────────────────────────

export type LivingOsCommandCategory =
  | "navigation"    // Open/close drawers, switch operating centers
  | "live_media"    // Join/leave rooms, broadcast start/end
  | "competitions"  // Battle, cypher, challenge lifecycle
  | "commerce"      // Purchase, book, campaign, prize delivery
  | "identity"      // Avatar, YoPho, profile, media upload
  | "analytics"     // Period change, report refresh, export
  | "beat_ecosystem"; // Beat Locker pipeline — submission through live commerce

// ─── Command Type Registry ────────────────────────────────────────────────────

export type LivingOsCommandType =
  // Navigation
  | "DRAWER_OPENED"
  | "DRAWER_CLOSED"
  | "DRAWER_SWITCHED"
  | "DRAWER_MINIMIZED"
  | "DRAWER_RESTORED"
  | "DRAWER_FULLSCREEN"
  | "OPERATING_CENTER_SWITCHED"
  | "QUICK_PANEL_OPENED"
  | "QUICK_PANEL_CLOSED"
  // Live Media
  | "ROOM_JOINED"
  | "ROOM_LEFT"
  | "BROADCAST_STARTED"
  | "BROADCAST_ENDED"
  // Competitions
  | "BATTLE_CREATED"
  | "BATTLE_JOINED"
  | "SCORE_SUBMITTED"
  // Commerce
  | "ITEM_PURCHASED"
  | "PERFORMER_BOOKED"
  | "CAMPAIGN_LAUNCHED"
  | "PRIZE_DELIVERED"
  | "REWARD_REDEEMED"
  // Identity
  | "AVATAR_SAVED"
  | "YOPHO_UPDATED"
  | "MEDIA_UPLOADED"
  | "PROFILE_UPDATED"
  // Analytics
  | "ANALYTICS_PERIOD_CHANGED"
  | "ANALYTICS_REPORT_REFRESHED"
  | "ANALYTICS_REPORT_EXPORTED"
  // Beat Ecosystem — Submission Center → Beat Locker → Marketplace pipeline
  | "BEAT_SUBMITTED"           // Creator pressed Submit in Submission Center
  | "BEAT_CERTIFICATION_STARTED" // Audio Certification Bot began processing
  | "BEAT_CERTIFICATION_PASSED"  // All automated checks passed
  | "BEAT_NEEDS_REVISION"      // Returned to creator with reviewer notes
  | "BEAT_APPROVED"            // Human reviewer approved the beat
  | "BEAT_PUBLISHED"           // Beat went LIVE in distribution pools
  | "BEAT_ASSIGNED"            // Beat routed to a specific competition pool
  | "BEAT_PLAYED"              // Beat played in any live event (battle/cypher/dance/etc)
  | "BEAT_FAVORITED"           // User favorited a beat
  | "BEAT_PREVIEWED"           // User previewed a beat in the marketplace
  | "BEAT_LICENSE_REQUESTED"   // User initiated a license purchase flow
  | "BEAT_LICENSE_PURCHASED"   // License transaction completed
  | "BEAT_AUCTION_STARTED"     // Live auction opened for a beat
  | "BEAT_BID_PLACED"          // A bid was placed in a live auction
  | "BEAT_AUCTION_CLOSED"      // Auction settled; winner determined
  | "BEAT_ROYALTY_PAID"        // Royalty distribution executed to creator(s)
  | "BEAT_DOWNLOAD_GRANTED"    // Buyer received download access
  | "BEAT_RETIRED";            // Beat permanently withdrawn from all pools

// ─── Command Schema ───────────────────────────────────────────────────────────

export interface LivingOsCommand {
  type: LivingOsCommandType;
  category: LivingOsCommandCategory;
  /** The authenticated user dispatching this command. */
  userId?: string;
  /** Platform role at dispatch time. */
  role?: "fan" | "performer" | "admin" | "beat_creator";
  /** Arbitrary command payload — shape varies by type. */
  payload?: Record<string, unknown>;
  /**
   * Optional idempotency key — commands with the same key within 2 s are dropped.
   * Use for debouncing rapid repeated actions.
   */
  idempotencyKey?: string;
  /** Schema version for forward compatibility. Defaults to 1. */
  schemaVersion?: number;
}

export interface LivingOsCommandResult {
  success: boolean;
  commandId: string;
  dispatchedAt: number;
  error?: string;
}

// ─── Listener type ────────────────────────────────────────────────────────────

export type CommandListener = (
  command: LivingOsCommand,
  result: LivingOsCommandResult,
) => void;

// ─── Idempotency cache (2-second dedup window) ───────────────────────────────

const _idem = new Map<string, number>();
const IDEM_TTL_MS = 2000;

function _isDuplicate(key: string): boolean {
  const last = _idem.get(key);
  if (last && Date.now() - last < IDEM_TTL_MS) return true;
  _idem.set(key, Date.now());
  // Prune old entries to prevent unbounded growth
  if (_idem.size > 200) {
    const cutoff = Date.now() - IDEM_TTL_MS;
    for (const [k, t] of _idem) if (t < cutoff) _idem.delete(k);
  }
  return false;
}

// ─── Listener registry ────────────────────────────────────────────────────────

const _listeners = new Map<LivingOsCommandType | "*", Set<CommandListener>>();

// ─── Singleton bus ────────────────────────────────────────────────────────────

export const livingOsCommandBus = {
  /**
   * Dispatch a command through the Living OS execution pipeline.
   * Never throws — returns a result object with success/error.
   */
  dispatch(command: LivingOsCommand): LivingOsCommandResult {
    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dispatchedAt = Date.now();

    // 1. Validate
    if (!command.type || !command.category) {
      return { success: false, commandId, dispatchedAt, error: "Missing type or category" };
    }

    // 2. Idempotency guard
    if (command.idempotencyKey && _isDuplicate(command.idempotencyKey)) {
      return { success: true, commandId, dispatchedAt }; // silently deduplicated
    }

    const result: LivingOsCommandResult = { success: true, commandId, dispatchedAt };

    // 3. Authorize — role/permission gate via Permission Registry
    if (command.role && command.payload?.actionId) {
      const actionId = command.payload.actionId as ActionId;
      if (!canExecute(actionId, command.role as PlatformRole)) {
        const reason = getDenialReason(actionId, command.role as PlatformRole);
        return { success: false, commandId, dispatchedAt, error: reason };
      }
    }

    // 4. Execute — notify registered listeners (runtime handlers)
    try {
      const typed = _listeners.get(command.type);
      const wildcard = _listeners.get("*");
      typed?.forEach((l) => l(command, result));
      wildcard?.forEach((l) => l(command, result));
    } catch (err) {
      result.success = false;
      result.error = err instanceof Error ? err.message : String(err);
    }

    // 5. Record / 7. Observe — emit to PersonaAnalyticsEngine (Observatory)
    if (typeof window !== "undefined") {
      try {
        emitEvent({
          eventName: command.type,
          domain: "drawer",
          userId: command.userId,
          meta: {
            category: command.category,
            commandId,
            role: command.role ?? "unknown",
            schemaVersion: command.schemaVersion ?? 1,
            ...(command.payload
              ? Object.fromEntries(
                  Object.entries(command.payload)
                    .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
                    .map(([k, v]) => [k, v as string | number | boolean]),
                )
              : {}),
          },
        });
      } catch {
        // Telemetry must never crash the application.
      }
    }

    return result;
  },

  /**
   * Register a runtime listener for a specific command type (or "*" for all).
   * Returns an unsubscribe function.
   */
  on(
    type: LivingOsCommandType | "*",
    listener: CommandListener,
  ): () => void {
    if (!_listeners.has(type)) _listeners.set(type, new Set());
    _listeners.get(type)!.add(listener);
    return () => _listeners.get(type)?.delete(listener);
  },

  /**
   * Preferred entry point: dispatch via the Action Registry.
   * Validates the action exists, checks permissions, then calls dispatch().
   *
   * Usage:
   *   livingOsCommandBus.executeAction('ACTION_VIEW_ANALYTICS',
   *     { userId, role: 'performer', payload: { panelId: 'analytics' } });
   */
  executeAction(
    actionId: ActionId,
    context: {
      userId?: string;
      role: PlatformRole;
      payload?: Record<string, unknown>;
      idempotencyKey?: string;
    },
  ): LivingOsCommandResult {
    const commandId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dispatchedAt = Date.now();

    // Validate action exists in registry
    const actionDef = getAction(actionId);
    if (!actionDef) {
      return { success: false, commandId, dispatchedAt, error: `Unknown action: ${actionId}` };
    }

    // Authorize via Permission Registry
    if (!canExecute(actionId, context.role)) {
      const reason = getDenialReason(actionId, context.role);
      return { success: false, commandId, dispatchedAt, error: reason };
    }

    // Warn on planned (not-yet-implemented) actions
    if (actionDef.status === "planned" && typeof console !== "undefined") {
      console.warn(`[LivingOS] Action "${actionId}" is planned but not yet implemented.`);
    }

    return this.dispatch({
      type: actionDef.commandType,
      category: actionDef.category,
      userId: context.userId,
      role: context.role,
      payload: { ...context.payload, actionId },
      idempotencyKey: context.idempotencyKey,
    });
  },
};
