// Admin control surfaces: reward board, live host controls, manual gifting,
// sponsor drop triggers, fraud review, Big Ace finance approvals.

export interface AdminAction {
  actionType: string;
  adminId: string;
  targetType: string;
  targetId: string;
  payload?: Record<string, unknown>;
  requiresBigAce?: boolean;
  note?: string;
}

// ── ADMIN CONTROL AREAS ───────────────────────────────────
export const ADMIN_SURFACES = {
  commandCenter:   { route: "/admin/command-center",   panel: "6-panel HUD overview" },
  finance:         { route: "/admin/finance/profit",   panel: "Big Ace weekly P&L approval" },
  rewardBoard:     { route: "/admin/rewards",          panel: "All active rules, drops, claims" },
  giveaways:       { route: "/admin/giveaways",        panel: "Create/trigger/manage giveaways" },
  prizeClaims:     { route: "/admin/prize-claims",     panel: "All claims with fulfillment status" },
  fraudReview:     { route: "/admin/reward-fraud",     panel: "Suspicious patterns, override/dismiss" },
  avatarItems:     { route: "/admin/avatar-items",     panel: "Item catalog, rarity, create/archive" },
  campaigns:       { route: "/admin/campaigns",        panel: "All ad campaigns, approve/reject" },
  bots:            { route: "/admin/bots",             panel: "Bot status, pause/resume, logs" },
  featureFlags:    { route: "/admin/feature-flags",    panel: "Toggle platform features" },
  health:          { route: "/admin/health",           panel: "All services, latency, error rates" },
  auditLogs:       { route: "/admin/audit-logs",       panel: "Every admin action with before/after" },
  emergency:       { route: "/admin/emergency",        panel: "Emergency stop, rollback triggers" },
  liveControl:     { route: "/admin/live",             panel: "All active rooms, stream health" },
} as const;

// ── HOST CONTROL PANEL (in-room) ─────────────────────────
export interface HostControlAction {
  type:
    | "change_lighting"        // change preset mid-show
    | "change_scene"           // change room scene
    | "trigger_reward_drop"    // fire audience giveaway
    | "fire_prompt"            // start trivia/reaction challenge
    | "manual_gift"            // gift item/points to specific user
    | "mute_user"              // mute a chat user
    | "remove_user"            // remove from room
    | "start_ad_break"         // trigger commercial break
    | "skip_ad_break"          // end break early
    | "switch_camera"          // VR camera switch
    | "start_round"            // for game sessions
    | "end_round"              // close round
    | "announce_winner"        // crown/winner reveal
    | "trigger_fireworks"      // VR/visual effect
    | "crowd_wave"             // trigger crowd wave
    | "pin_message"            // pin chat message
    | "change_broadcaster"     // swap personality
    | "show_lower_third"       // custom text overlay
    | "hide_lower_third";
  payload?: Record<string, unknown>;
  sessionId: string;
  triggeredBy: string;         // userId
  loggedToAudit: true;         // always
}

// ── SPONSOR DROP TRIGGER PANEL ────────────────────────────
export interface SponsorDropTrigger {
  sponsorId: string;
  campaignId: string;
  dropTableId: string;
  roomId?: string;          // specific room or null for platform-wide
  eventId?: string;
  triggerType: "immediate" | "scheduled" | "on_event";
  scheduledAt?: Date;
  onEvent?: string;         // "game_winner" | "crown_event" | "custom"
  announceText: string;     // "XYZ is giving away..."
  maxDrops: number;
  requiresApproval: boolean;
  approvedByBigAce?: boolean;
}

// ── FRAUD REVIEW INTERFACE ────────────────────────────────
export interface FraudReviewEntry {
  flagId: string;
  userId: string;
  claimId: string;
  reason: string;
  patternData: {
    claimsInLast24h: number;
    claimsInMultipleRoomsSimultaneously: boolean;
    velocityScore: number;        // 0-100, higher = more suspicious
    accountAgeDays: number;
    previousFlags: number;
  };
  recommendation: "approve" | "reject" | "escalate";
  action?: "approved" | "rejected" | "user_banned" | "dismissed";
  reviewedBy?: string;
  reviewedAt?: Date;
}
