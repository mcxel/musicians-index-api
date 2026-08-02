/**
 * universalPermissionRegistry — Living OS Permission Registry (locked 2026-08-01).
 *
 * Replaces scattered `role === "performer"` checks throughout the codebase.
 * Every action simply asks `canExecute(actionId, role)` instead.
 *
 * Authorization model:
 *   canExecute(actionId, role) → boolean
 *
 * The registry merges:
 *   1. The action's `defaultAllowedRoles` from universalActionRegistry
 *   2. Per-action overrides defined here (PERMISSION_OVERRIDES)
 *
 * Override wins if present; default is used otherwise.
 *
 * Usage:
 *   import { canExecute } from "@/lib/os/universalPermissionRegistry";
 *   if (!canExecute("ACTION_START_BROADCAST", "fan")) return null;
 */

import { ACTION_REGISTRY, type ActionId } from "@/lib/os/universalActionRegistry";

/**
 * Platform role union.
 * - fan / performer / admin: primary account roles (Rule 26)
 * - beat_creator: contributor role granted to Official Beat Creators (e.g. Founding Beat Creators).
 *   This is an ADDITIVE role — a beat_creator may also hold fan/performer/admin.
 *   In canExecute(), a beat_creator is granted all beat_creator-listed overrides
 *   plus either their base role permissions.
 */
export type PlatformRole = "fan" | "performer" | "admin" | "beat_creator";

// ─── Per-action permission overrides ─────────────────────────────────────────
// Only list actions where the override differs from the registry default.

const PERMISSION_OVERRIDES: Partial<Record<ActionId, PlatformRole[]>> = {
  // AI workforce — admin-only, explicit
  ACTION_SUMMON_BIG_ACE:         ["admin"],
  ACTION_SUMMON_MICHAEL_CHARLIE: ["admin"],
  ACTION_OPEN_OBSERVATORY:       ["admin"],

  // Commerce — ticket selling restricted to admin (Rule 17: Venue/Promoter only)
  ACTION_SELL_TICKET:   ["admin"],
  ACTION_BOOK_ARTIST:   ["admin"],
  ACTION_DROP_PRIZE:    ["admin"],
  ACTION_LAUNCH_CAMPAIGN: ["admin"],

  // Identity — avatar is fan-only (Rule 26)
  ACTION_SAVE_AVATAR:   ["fan", "admin"],

  // Fan-only Operating Centers (Rule 26)
  ACTION_OPEN_AVATAR_CENTER:    ["fan", "admin"],
  ACTION_OPEN_MEMORY_CENTER:    ["fan", "admin"],
  ACTION_OPEN_REWARDS_CENTER:   ["fan", "admin"],
  ACTION_OPEN_STATISTICS_CENTER: ["fan", "admin"],
  ACTION_OPEN_PRIZE_VAULT:      ["fan", "admin"],

  // Performer-only Operating Centers (Rule 26)
  ACTION_OPEN_BOOKING_CENTER:   ["performer", "admin"],
  ACTION_OPEN_MEDIA_CENTER:     ["performer", "admin"],
  ACTION_OPEN_BIO_MAGAZINE_CENTER: ["performer", "admin"],
  ACTION_OPEN_COMMERCE_CENTER:   ["performer", "admin"],
  ACTION_OPEN_COMMERCIAL_CENTER: ["performer", "admin"],
  ACTION_OPEN_ANALYTICS_CENTER:  ["performer", "admin"],
  ACTION_RUN_RELEASE_NEW_WORK:   ["performer", "admin"],
  ACTION_CREATE_YOPHO_DRAFT:     ["fan", "performer", "admin"],
  ACTION_PUBLISH_YOPHO:          ["fan", "performer", "admin"],
  ACTION_ARCHIVE_YOPHO:          ["fan", "performer", "admin"],
  ACTION_COLLECT_YOPHO:          ["fan", "admin"],
  ACTION_OPEN_BOOKING:          ["performer", "admin"],
  ACTION_VIEW_ANALYTICS:        ["performer", "admin"],
  ACTION_OPEN_MEDIA_LOCKER:     ["performer", "admin"],
  ACTION_OPEN_BEAT_LAB:         ["performer", "admin"],
  ACTION_START_BROADCAST:       ["performer", "admin"],
  ACTION_END_BROADCAST:         ["performer", "admin"],
  ACTION_GO_LIVE:               ["performer", "admin"],
  ACTION_START_BATTLE:          ["performer", "admin"],
  ACTION_START_CYPHER:          ["performer", "admin"],

  // Beat Creator role — exclusive to accounts with the beat_creator contributor role
  // (does not require admin; Beat Creators are NOT admins unless separately assigned)
  ACTION_UPLOAD_BEAT:                  ["beat_creator", "admin"],
  ACTION_EDIT_BEAT:                    ["beat_creator", "admin"],
  ACTION_REPLACE_BEAT:                 ["beat_creator", "admin"],
  ACTION_DELETE_BEAT:                  ["beat_creator", "admin"],
  ACTION_SUBMIT_BEAT_TO_BATTLE:        ["beat_creator", "admin"],
  ACTION_SUBMIT_BEAT_TO_CYPHER:        ["beat_creator", "admin"],
  ACTION_SUBMIT_BEAT_TO_CHALLENGE:     ["beat_creator", "admin"],
  ACTION_VIEW_BEAT_SUBMISSION_STATUS:  ["beat_creator", "admin"],
  ACTION_VIEW_BEAT_APPROVAL_STATUS:    ["beat_creator", "admin"],
  ACTION_OPEN_BEAT_LOCKER_CENTER:      ["beat_creator", "admin"],
  ACTION_OPEN_BEAT_REVENUE_DASHBOARD:  ["beat_creator", "admin"],
  ACTION_DOWNLOAD_BEAT_REPORT:         ["beat_creator", "admin"],
};

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the given role is allowed to execute the given action.
 * Unknown action IDs always return false.
 */
export function canExecute(actionId: ActionId, role: PlatformRole): boolean {
  const override = PERMISSION_OVERRIDES[actionId];
  if (override) return override.includes(role);

  const def = ACTION_REGISTRY[actionId];
  if (!def) return false;

  return (def.defaultAllowedRoles as readonly PlatformRole[]).includes(role);
}

/**
 * Returns all action IDs executable by a role.
 */
export function actionsForRole(role: PlatformRole): ActionId[] {
  return (Object.keys(ACTION_REGISTRY) as ActionId[]).filter(
    (id) => canExecute(id, role),
  );
}

/**
 * Returns a human-readable denial reason for Observatory / error states.
 */
export function getDenialReason(actionId: ActionId, role: PlatformRole): string {
  const def = ACTION_REGISTRY[actionId];
  if (!def) return `Unknown action: ${actionId}`;
  const allowed = PERMISSION_OVERRIDES[actionId] ?? def.defaultAllowedRoles;
  return `Action "${def.label}" requires one of: ${allowed.join(", ")}. Current role: ${role}.`;
}
