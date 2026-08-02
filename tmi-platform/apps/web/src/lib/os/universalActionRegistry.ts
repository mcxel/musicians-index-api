/**
 * universalActionRegistry — Living OS Action Registry (locked 2026-08-01).
 *
 * Every user-facing action in the platform has a canonical entry here.
 * Buttons do NOT call runtimes directly — they call executeAction(), which
 * routes through the Permission Registry and the Living OS Command Bus.
 *
 * Registration Rule (Principle 3): no action is complete until it appears here.
 *
 * Lifecycle:
 *   Button click
 *     → executeAction(ACTION_ID, context)
 *     → Permission check (universalPermissionRegistry.canExecute)
 *     → livingOsCommandBus.dispatch(command)
 *     → Runtime handler
 *     → Observatory / PersonaAnalyticsEngine
 */

import type { LivingOsCommandType, LivingOsCommandCategory } from "@/lib/os/livingOsCommandBus";

// ─── Action ID Registry ───────────────────────────────────────────────────────

export type ActionId =
  // ── Navigation (Operating Centers & Drawers) ─────────────────────────────
  | "ACTION_OPEN_COMMUNICATION_CENTER"
  | "ACTION_OPEN_BOOKING_CENTER"
  | "ACTION_OPEN_MEDIA_CENTER"
  | "ACTION_OPEN_BIO_MAGAZINE_CENTER"
  | "ACTION_OPEN_COMMERCE_CENTER"
  | "ACTION_OPEN_COMMERCIAL_CENTER"
  | "ACTION_OPEN_ANALYTICS_CENTER"
  | "ACTION_OPEN_YOPHO_STUDIO"
  | "ACTION_CREATE_YOPHO_DRAFT"
  | "ACTION_PUBLISH_YOPHO"
  | "ACTION_ARCHIVE_YOPHO"
  | "ACTION_COLLECT_YOPHO"
  | "ACTION_OPEN_AVATAR_CENTER"
  | "ACTION_OPEN_MEMORY_CENTER"
  | "ACTION_OPEN_REWARDS_CENTER"
  | "ACTION_OPEN_STATISTICS_CENTER"
  | "ACTION_OPEN_BOOKING"
  | "ACTION_OPEN_PRIZE_VAULT"
  | "ACTION_VIEW_ANALYTICS"
  | "ACTION_CHANGE_ANALYTICS_PERIOD"
  | "ACTION_SHARE_YOPHO"
  | "ACTION_OPEN_MEDIA_LOCKER"
  | "ACTION_OPEN_BEAT_LAB"
  | "ACTION_CLOSE_DRAWER"
  | "ACTION_SET_ACTIVE_PERFORMER"
  | "ACTION_OPEN_MARKETPLACE"
  | "ACTION_OPEN_SHOP"
  // ── Beat Creator (Beat Locker contributor role) ───────────────────────────
  | "ACTION_UPLOAD_BEAT"
  | "ACTION_EDIT_BEAT"
  | "ACTION_REPLACE_BEAT"
  | "ACTION_DELETE_BEAT"
  | "ACTION_SUBMIT_BEAT_TO_BATTLE"
  | "ACTION_SUBMIT_BEAT_TO_CYPHER"
  | "ACTION_SUBMIT_BEAT_TO_CHALLENGE"
  | "ACTION_VIEW_BEAT_SUBMISSION_STATUS"
  | "ACTION_VIEW_BEAT_APPROVAL_STATUS"
  | "ACTION_OPEN_BEAT_LOCKER_CENTER"
  | "ACTION_OPEN_BEAT_REVENUE_DASHBOARD"
  | "ACTION_DOWNLOAD_BEAT_REPORT"
  // ── Live Media ────────────────────────────────────────────────────────────
  | "ACTION_JOIN_ROOM"
  | "ACTION_LEAVE_ROOM"
  | "ACTION_START_BROADCAST"
  | "ACTION_END_BROADCAST"
  | "ACTION_GO_LIVE"
  // ── Competitions ─────────────────────────────────────────────────────────
  | "ACTION_START_BATTLE"
  | "ACTION_JOIN_BATTLE"
  | "ACTION_START_CYPHER"
  | "ACTION_JOIN_CYPHER"
  | "ACTION_SUBMIT_SCORE"
  // ── Commerce ─────────────────────────────────────────────────────────────
  | "ACTION_PURCHASE_ITEM"
  | "ACTION_BOOK_ARTIST"
  | "ACTION_LAUNCH_CAMPAIGN"
  | "ACTION_DROP_PRIZE"
  | "ACTION_REDEEM_REWARD"
  | "ACTION_SELL_TICKET"
  | "ACTION_RUN_RELEASE_NEW_WORK"
  // ── Identity ─────────────────────────────────────────────────────────────
  | "ACTION_SAVE_AVATAR"
  | "ACTION_UPDATE_PROFILE"
  | "ACTION_UPLOAD_MEDIA"
  // ── AI Workforce ─────────────────────────────────────────────────────────
  | "ACTION_SUMMON_BIG_ACE"
  | "ACTION_SUMMON_MICHAEL_CHARLIE"
  | "ACTION_OPEN_OBSERVATORY";

// ─── Action Definition ────────────────────────────────────────────────────────

export interface ActionDef {
  id: ActionId;
  label: string;
  /** Human-readable description for Observatory and audit logs. */
  description: string;
  category: LivingOsCommandCategory;
  /** Maps to the living OS command bus command type. */
  commandType: LivingOsCommandType;
  /** Roles allowed by default — Permission Registry overrides per-action. */
  defaultAllowedRoles: ("fan" | "performer" | "admin")[];
  /** Marks actions not yet implemented in runtime — logged but no-op dispatches. */
  status: "active" | "planned";
}

// ─── Action Registry ──────────────────────────────────────────────────────────

export const ACTION_REGISTRY: Record<ActionId, ActionDef> = {
  // Navigation
  ACTION_OPEN_COMMUNICATION_CENTER: {
    id: "ACTION_OPEN_COMMUNICATION_CENTER",
    label: "Open Communication Center",
    description: "Opens the Communication Operating Center drawer",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_BOOKING_CENTER: {
    id: "ACTION_OPEN_BOOKING_CENTER",
    label: "Open Booking Center",
    description: "Opens the Booking Operating Center drawer",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_MEDIA_CENTER: {
    id: "ACTION_OPEN_MEDIA_CENTER",
    label: "Open Media Center",
    description: "Opens the Media Operating Center drawer",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_BIO_MAGAZINE_CENTER: {
    id: "ACTION_OPEN_BIO_MAGAZINE_CENTER",
    label: "Open Bio & Magazine Center",
    description: "Opens the Performer Bio & Magazine Operating Center drawer",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_COMMERCE_CENTER: {
    id: "ACTION_OPEN_COMMERCE_CENTER",
    label: "Open Commerce Center",
    description: "Opens the Creator Commerce Center Operating Center drawer",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_COMMERCIAL_CENTER: {
    id: "ACTION_OPEN_COMMERCIAL_CENTER",
    label: "Open Commercial Center",
    description: "Opens the Commercial Operating Center drawer",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_CREATE_YOPHO_DRAFT: {
    id: "ACTION_CREATE_YOPHO_DRAFT",
    label: "Create YoPho Draft",
    description: "Creates a draft YoPho collectible edition (not yet published)",
    category: "identity",
    commandType: "YOPHO_DRAFT_CREATED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_PUBLISH_YOPHO: {
    id: "ACTION_PUBLISH_YOPHO",
    label: "Publish YoPho Edition",
    description: "Publishes a YoPho edition as Current and archives the prior Current",
    category: "identity",
    commandType: "YOPHO_PUBLISHED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_ARCHIVE_YOPHO: {
    id: "ACTION_ARCHIVE_YOPHO",
    label: "Archive YoPho Edition",
    description: "Archives a YoPho edition; collectors keep prior ownership",
    category: "identity",
    commandType: "YOPHO_ARCHIVED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_COLLECT_YOPHO: {
    id: "ACTION_COLLECT_YOPHO",
    label: "Collect YoPho Edition",
    description: "Fan collects a published YoPho edition by editionId",
    category: "identity",
    commandType: "YOPHO_COLLECTED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_OPEN_ANALYTICS_CENTER: {
    id: "ACTION_OPEN_ANALYTICS_CENTER",
    label: "Open Analytics Center",
    description: "Opens the Analytics Operating Center drawer",
    category: "analytics",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_YOPHO_STUDIO: {
    id: "ACTION_OPEN_YOPHO_STUDIO",
    label: "Open YoPho Studio",
    description: "Opens the YoPho Studio Operating Center drawer",
    category: "identity",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_AVATAR_CENTER: {
    id: "ACTION_OPEN_AVATAR_CENTER",
    label: "Open Avatar Center",
    description: "Opens the Avatar Operating Center (Fan only — Rule 26)",
    category: "identity",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_OPEN_MEMORY_CENTER: {
    id: "ACTION_OPEN_MEMORY_CENTER",
    label: "Open Memory Center",
    description: "Opens the Memory Wall Operating Center drawer",
    category: "identity",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_OPEN_REWARDS_CENTER: {
    id: "ACTION_OPEN_REWARDS_CENTER",
    label: "Open Rewards Center",
    description: "Opens the Rewards / Prize Vault Operating Center (Fan only)",
    category: "navigation",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_OPEN_STATISTICS_CENTER: {
    id: "ACTION_OPEN_STATISTICS_CENTER",
    label: "Open Statistics Center",
    description: "Opens the Fan Statistics Operating Center drawer",
    category: "analytics",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_OPEN_BOOKING: {
    id: "ACTION_OPEN_BOOKING",
    label: "Open Bookings",
    description: "Opens the booking management workspace",
    category: "commerce",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_PRIZE_VAULT: {
    id: "ACTION_OPEN_PRIZE_VAULT",
    label: "Open Prize Vault",
    description: "Opens the fan prize vault",
    category: "navigation",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_VIEW_ANALYTICS: {
    id: "ACTION_VIEW_ANALYTICS",
    label: "View Analytics",
    description: "Opens the analytics dashboard",
    category: "analytics",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_CHANGE_ANALYTICS_PERIOD: {
    id: "ACTION_CHANGE_ANALYTICS_PERIOD",
    label: "Change Analytics Period",
    description: "Changes the selected analytics reporting period",
    category: "analytics",
    commandType: "ANALYTICS_PERIOD_CHANGED",
    defaultAllowedRoles: ["performer", "fan", "admin"],
    status: "active",
  },
  ACTION_SHARE_YOPHO: {
    id: "ACTION_SHARE_YOPHO",
    label: "Share YoPho Card",
    description: "Shares the user's YoPho identity card",
    category: "identity",
    commandType: "YOPHO_UPDATED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_MEDIA_LOCKER: {
    id: "ACTION_OPEN_MEDIA_LOCKER",
    label: "Open Media Locker",
    description: "Opens the performer Media Locker",
    category: "identity",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_BEAT_LAB: {
    id: "ACTION_OPEN_BEAT_LAB",
    label: "Open Beat Lab",
    description: "Opens the Beat Lab / Competition Vault (Performer)",
    category: "identity",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_CLOSE_DRAWER: {
    id: "ACTION_CLOSE_DRAWER",
    label: "Close Drawer",
    description: "Closes the currently open Operating Center drawer",
    category: "navigation",
    commandType: "DRAWER_CLOSED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  // Live Media
  ACTION_JOIN_ROOM: {
    id: "ACTION_JOIN_ROOM",
    label: "Join Room",
    description: "Joins a live room",
    category: "live_media",
    commandType: "ROOM_JOINED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_LEAVE_ROOM: {
    id: "ACTION_LEAVE_ROOM",
    label: "Leave Room",
    description: "Leaves the current live room",
    category: "live_media",
    commandType: "ROOM_LEFT",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_START_BROADCAST: {
    id: "ACTION_START_BROADCAST",
    label: "Start Broadcast",
    description: "Begins a live broadcast stream",
    category: "live_media",
    commandType: "BROADCAST_STARTED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_END_BROADCAST: {
    id: "ACTION_END_BROADCAST",
    label: "End Broadcast",
    description: "Ends a live broadcast stream",
    category: "live_media",
    commandType: "BROADCAST_ENDED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_GO_LIVE: {
    id: "ACTION_GO_LIVE",
    label: "Go Live",
    description: "Navigates to the Go Live setup page",
    category: "live_media",
    commandType: "BROADCAST_STARTED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  // Competitions
  ACTION_START_BATTLE: {
    id: "ACTION_START_BATTLE",
    label: "Start Battle",
    description: "Creates a new Mini Battle (qualified Gold Performer+)",
    category: "competitions",
    commandType: "BATTLE_CREATED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "planned",
  },
  ACTION_JOIN_BATTLE: {
    id: "ACTION_JOIN_BATTLE",
    label: "Join Battle",
    description: "Joins an existing battle",
    category: "competitions",
    commandType: "BATTLE_JOINED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "planned",
  },
  ACTION_START_CYPHER: {
    id: "ACTION_START_CYPHER",
    label: "Start Cypher",
    description: "Creates a new Mini Cypher",
    category: "competitions",
    commandType: "BATTLE_CREATED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "planned",
  },
  ACTION_JOIN_CYPHER: {
    id: "ACTION_JOIN_CYPHER",
    label: "Join Cypher",
    description: "Joins an existing cypher",
    category: "competitions",
    commandType: "BATTLE_JOINED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "planned",
  },
  ACTION_SUBMIT_SCORE: {
    id: "ACTION_SUBMIT_SCORE",
    label: "Submit Score",
    description: "Submits a competition score",
    category: "competitions",
    commandType: "SCORE_SUBMITTED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "planned",
  },
  // Commerce
  ACTION_PURCHASE_ITEM: {
    id: "ACTION_PURCHASE_ITEM",
    label: "Purchase Item",
    description: "Initiates a Stripe purchase flow",
    category: "commerce",
    commandType: "ITEM_PURCHASED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_BOOK_ARTIST: {
    id: "ACTION_BOOK_ARTIST",
    label: "Book Artist",
    description: "Submits a booking request for a performer (Venue/Promoter/Admin)",
    category: "commerce",
    commandType: "PERFORMER_BOOKED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_LAUNCH_CAMPAIGN: {
    id: "ACTION_LAUNCH_CAMPAIGN",
    label: "Launch Campaign",
    description: "Launches a sponsor or advertiser campaign",
    category: "commerce",
    commandType: "CAMPAIGN_LAUNCHED",
    defaultAllowedRoles: ["admin"],
    status: "planned",
  },
  ACTION_DROP_PRIZE: {
    id: "ACTION_DROP_PRIZE",
    label: "Drop Prize",
    description: "Distributes a prize to a winner",
    category: "commerce",
    commandType: "PRIZE_DELIVERED",
    defaultAllowedRoles: ["admin"],
    status: "planned",
  },
  ACTION_REDEEM_REWARD: {
    id: "ACTION_REDEEM_REWARD",
    label: "Redeem Reward",
    description: "Redeems a fan reward or prize claim",
    category: "commerce",
    commandType: "REWARD_REDEEMED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "planned",
  },
  ACTION_SELL_TICKET: {
    id: "ACTION_SELL_TICKET",
    label: "Sell Ticket",
    description: "Initiates ticket inventory sale (Venue/Promoter/Admin only — Rule 17)",
    category: "commerce",
    commandType: "ITEM_PURCHASED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  // Identity
  ACTION_SAVE_AVATAR: {
    id: "ACTION_SAVE_AVATAR",
    label: "Save Avatar",
    description: "Saves fan avatar customization (Fan only — Rule 26)",
    category: "identity",
    commandType: "AVATAR_SAVED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_UPDATE_PROFILE: {
    id: "ACTION_UPDATE_PROFILE",
    label: "Update Profile",
    description: "Saves profile changes",
    category: "identity",
    commandType: "PROFILE_UPDATED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_UPLOAD_MEDIA: {
    id: "ACTION_UPLOAD_MEDIA",
    label: "Upload Media",
    description: "Uploads media to the performer Media Locker or fan Memory Wall",
    category: "identity",
    commandType: "MEDIA_UPLOADED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  // AI Workforce
  ACTION_SUMMON_BIG_ACE: {
    id: "ACTION_SUMMON_BIG_ACE",
    label: "Summon Big Ace",
    description: "Opens the Big Ace executive AI interface (Admin/Executive only)",
    category: "navigation",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["admin"],
    status: "planned",
  },
  ACTION_SUMMON_MICHAEL_CHARLIE: {
    id: "ACTION_SUMMON_MICHAEL_CHARLIE",
    label: "Summon Michael Charlie",
    description: "Opens the Michael Charlie GM AI interface (Admin only)",
    category: "navigation",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["admin"],
    status: "planned",
  },
  ACTION_OPEN_OBSERVATORY: {
    id: "ACTION_OPEN_OBSERVATORY",
    label: "Open Observatory",
    description: "Opens the admin Observatory dashboard",
    category: "navigation",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  // ── Beat Creator ─────────────────────────────────────────────────────────
  ACTION_UPLOAD_BEAT: {
    id: "ACTION_UPLOAD_BEAT",
    label: "Upload Beat",
    description: "Upload a new beat to the Beat Locker (Beat Creator role required)",
    category: "beat_ecosystem",
    commandType: "BEAT_SUBMITTED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_EDIT_BEAT: {
    id: "ACTION_EDIT_BEAT",
    label: "Edit Beat",
    description: "Edit metadata for an existing Beat Locker entry",
    category: "beat_ecosystem",
    commandType: "BEAT_SUBMITTED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_REPLACE_BEAT: {
    id: "ACTION_REPLACE_BEAT",
    label: "Replace Beat",
    description: "Replace an existing beat file while preserving metadata",
    category: "beat_ecosystem",
    commandType: "BEAT_SUBMITTED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_DELETE_BEAT: {
    id: "ACTION_DELETE_BEAT",
    label: "Delete Beat",
    description: "Remove a beat from the Beat Locker (non-reversible if used in past competitions)",
    category: "beat_ecosystem",
    commandType: "BEAT_RETIRED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_SUBMIT_BEAT_TO_BATTLE: {
    id: "ACTION_SUBMIT_BEAT_TO_BATTLE",
    label: "Submit Beat to Battle Queue",
    description: "Submit an approved beat for use in Battle rounds",
    category: "beat_ecosystem",
    commandType: "BEAT_ASSIGNED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_SUBMIT_BEAT_TO_CYPHER: {
    id: "ACTION_SUBMIT_BEAT_TO_CYPHER",
    label: "Submit Beat to Cypher Queue",
    description: "Submit an approved beat for use in Cypher sessions",
    category: "beat_ecosystem",
    commandType: "BEAT_ASSIGNED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_SUBMIT_BEAT_TO_CHALLENGE: {
    id: "ACTION_SUBMIT_BEAT_TO_CHALLENGE",
    label: "Submit Beat to Challenge Queue",
    description: "Submit an approved beat for use in Challenge rounds",
    category: "beat_ecosystem",
    commandType: "BEAT_ASSIGNED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_VIEW_BEAT_SUBMISSION_STATUS: {
    id: "ACTION_VIEW_BEAT_SUBMISSION_STATUS",
    label: "View Beat Submission Status",
    description: "Check the current pipeline status for all submitted beats",
    category: "beat_ecosystem",
    commandType: "BEAT_SUBMITTED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_VIEW_BEAT_APPROVAL_STATUS: {
    id: "ACTION_VIEW_BEAT_APPROVAL_STATUS",
    label: "View Beat Approval Status",
    description: "Check which beats are approved, pending, or rejected",
    category: "beat_ecosystem",
    commandType: "BEAT_APPROVED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_OPEN_BEAT_LOCKER_CENTER: {
    id: "ACTION_OPEN_BEAT_LOCKER_CENTER",
    label: "Open Beat Locker Center",
    description: "Opens the Beat Locker Operating Center (Beat Creator role required)",
    category: "beat_ecosystem",
    commandType: "OPERATING_CENTER_SWITCHED",
    defaultAllowedRoles: ["admin"],
    status: "active",
  },
  ACTION_OPEN_BEAT_REVENUE_DASHBOARD: {
    id: "ACTION_OPEN_BEAT_REVENUE_DASHBOARD",
    label: "Open Beat Revenue Dashboard",
    description: "View royalty, licensing, and revenue data for Beat Locker entries",
    category: "beat_ecosystem",
    commandType: "ANALYTICS_PERIOD_CHANGED",
    defaultAllowedRoles: ["admin"],
    status: "planned",
  },
  ACTION_DOWNLOAD_BEAT_REPORT: {
    id: "ACTION_DOWNLOAD_BEAT_REPORT",
    label: "Download Beat Report",
    description: "Export beat performance and earnings data as a report",
    category: "beat_ecosystem",
    commandType: "ANALYTICS_REPORT_EXPORTED",
    defaultAllowedRoles: ["admin"],
    status: "planned",
  },
  ACTION_RUN_RELEASE_NEW_WORK: {
    id: "ACTION_RUN_RELEASE_NEW_WORK",
    label: "Release New Work",
    description:
      "Runs the RELEASE_NEW_WORK Living OS automation (commerce, distributor queue, YoPho opt-in, notify, analytics)",
    category: "automation",
    commandType: "WORKFLOW_STARTED",
    defaultAllowedRoles: ["performer", "admin"],
    status: "active",
  },
  ACTION_SET_ACTIVE_PERFORMER: {
    id: "ACTION_SET_ACTIVE_PERFORMER",
    label: "Set Active Performer",
    description:
      "Sets Living OS ACTIVE_PERFORMER (id/slug) so Marketplace / Shop / context panels rebind without unmounting drawers",
    category: "navigation",
    commandType: "ACTIVE_PERFORMER_SET",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
  ACTION_OPEN_MARKETPLACE: {
    id: "ACTION_OPEN_MARKETPLACE",
    label: "Open Marketplace",
    description: "Opens the fan Marketplace drawer for ACTIVE_PERFORMER products",
    category: "navigation",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["fan", "admin"],
    status: "active",
  },
  ACTION_OPEN_SHOP: {
    id: "ACTION_OPEN_SHOP",
    label: "Open Shop",
    description: "Opens the Shop drawer (Personal Store + TMI Store split)",
    category: "navigation",
    commandType: "DRAWER_OPENED",
    defaultAllowedRoles: ["fan", "performer", "admin"],
    status: "active",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Look up a registered action by ID. Returns null for unknown IDs (never throws). */
export function getAction(id: ActionId): ActionDef | null {
  return ACTION_REGISTRY[id] ?? null;
}

/** All actions for a given category. */
export function actionsByCategory(
  category: LivingOsCommandCategory,
): ActionDef[] {
  return Object.values(ACTION_REGISTRY).filter((a) => a.category === category);
}

/** All active (non-planned) actions. */
export function activeActions(): ActionDef[] {
  return Object.values(ACTION_REGISTRY).filter((a) => a.status === "active");
}
