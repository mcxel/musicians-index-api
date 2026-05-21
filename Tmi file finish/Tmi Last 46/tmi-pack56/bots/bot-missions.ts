// packages/bot-missions/src/bot-missions.ts
// All bot mission types, schedules, and behavioral rules.

export interface BotMission {
  missionId: string;
  botId: string;
  type: BotMissionType;
  priority: "critical" | "high" | "medium" | "low";
  schedule?: string;           // cron expression
  trigger?: string;            // event type that triggers this
  maxActionsPerRun: number;    // safety limit
  cooldownSeconds: number;     // min between runs
  requiresApproval: boolean;   // Big Ace / admin must approve
  maxBudgetCents: number;      // 0 = no money involved
  targetEntityType?: string;
  targetCriteria?: Record<string, unknown>;
  actions: string[];           // what the bot actually does
  successMetric: string;       // how success is measured
}

export type BotMissionType =
  | "ARTIST_ACQUISITION"       // find and invite new artists
  | "VENUE_ACQUISITION"        // find and invite venues
  | "SPONSOR_DISCOVERY"        // find local/platform sponsors
  | "SPONSOR_OUTREACH"         // contact potential sponsors
  | "SPONSOR_PROPOSAL"         // generate and send proposals
  | "DEAL_FOLLOWUP"            // follow up on pending deals
  | "MEMBER_RETENTION"         // re-engage inactive members
  | "ARTICLE_GENERATION"       // auto-generate articles
  | "ARTICLE_PLACEMENT"        // place articles in homepage belts
  | "HIGHLIGHT_CLIPPING"       // generate clips from streams
  | "MODERATION_SWEEP"         // review flagged content
  | "CHAT_MODERATION"          // monitor live room chat
  | "ROOM_CONCIERGE"           // assist room guests
  | "BOT_ROOM_FILLER"          // maintain minimum room activity
  | "TRENDING_UPDATE"          // refresh trending lists
  | "LEADERBOARD_UPDATE"       // recalculate rankings
  | "CROWN_EVALUATION"         // run weekly crown logic
  | "FINANCE_ANOMALY"          // detect revenue issues
  | "PAYOUT_REMINDER"          // remind pending payouts to Big Ace
  | "RENEWAL_OUTREACH"         // sponsor renewal campaign
  | "SEARCH_INDEX_UPDATE"      // keep search indexes fresh
  | "ANALYTICS_AGGREGATION"    // aggregate analytics events
  | "QUALITY_ASSURANCE"        // spot-check platform health
  | "WEBHOOK_MONITOR"          // watch for failed webhooks
  | "ANTI_FRAUD_REVIEW"        // review suspicious patterns
  | "BIRTHDAY_SHOUTOUT"        // special artist moment bots
  | "MILESTONE_ANNOUNCE";      // announce follower milestones

export const CORE_MISSIONS: BotMission[] = [
  {
    missionId:"m001", botId:"billing-integrity", type:"SPONSOR_DISCOVERY",
    priority:"critical", schedule:"0 */4 * * *",
    maxActionsPerRun:1, cooldownSeconds:14400, requiresApproval:false, maxBudgetCents:0,
    actions:["verify_diamond_status_marcel","verify_diamond_status_bj_mbeat","reset_if_changed"],
    successMetric:"isPermanentDiamond = true for both users",
  },
  {
    missionId:"m002", botId:"house-ad-fallback", type:"ARTICLE_PLACEMENT",
    priority:"critical", schedule:"*/2 * * * *",
    maxActionsPerRun:20, cooldownSeconds:60, requiresApproval:false, maxBudgetCents:0,
    actions:["check_all_ad_zones","fill_empty_zones_with_fallback","log_fills"],
    successMetric:"All zones return 200 (Platform Law #7)",
  },
  {
    missionId:"m003", botId:"sponsor-matching", type:"SPONSOR_DISCOVERY",
    priority:"high", schedule:"0 9 * * *",
    maxActionsPerRun:50, cooldownSeconds:86400, requiresApproval:false, maxBudgetCents:0,
    actions:["scan_new_artists","calculate_local_sponsor_score","queue_outreach"],
    successMetric:"N sponsors matched per day",
  },
  {
    missionId:"m004", botId:"article-freshness", type:"ARTICLE_PLACEMENT",
    priority:"medium", schedule:"0 2 * * *",
    maxActionsPerRun:200, cooldownSeconds:86400, requiresApproval:false, maxBudgetCents:0,
    actions:["recalculate_freshness_scores","update_placement_weights","purge_stale_surfaces"],
    successMetric:"No content repeats on same surface within threshold",
  },
  {
    missionId:"m005", botId:"crown", type:"CROWN_EVALUATION",
    priority:"critical", schedule:"0 0 * * 0",
    maxActionsPerRun:1, cooldownSeconds:604800, requiresApproval:false, maxBudgetCents:0,
    actions:["evaluate_weekly_battle_results","create_crown_record","emit_crown_awarded","generate_recap_article","update_hall_of_fame"],
    successMetric:"Crown awarded and article published (Platform Law #9 enforced)",
  },
];
