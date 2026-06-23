import type { TMIRole } from "@/types/roles";

export type SpecialAuthorityRole = "MUSIC_DIRECTOR" | "OWNER_EXECUTIVE_DIRECTOR" | "EXECUTIVE_AI";

export type CoreFeature =
  | "profile"
  | "avatar"
  | "cover_image"
  | "article_image"
  | "memory_wall"
  | "messaging"
  | "notifications"
  | "playlist"
  | "camera"
  | "video_panels"
  | "image_wallet"
  | "search"
  | "friends_followers"
  | "settings"
  | "membership_management";

export type RoleCapability =
  | "follow_accounts"
  | "build_playlists"
  | "join_rooms"
  | "join_audiences"
  | "buy_tickets"
  | "tip_performers"
  | "buy_memberships"
  | "buy_merchandise"
  | "join_contests"
  | "join_games"
  | "join_challenges"
  | "join_fan_lobbies"
  | "upload_photos"
  | "upload_memories"
  | "create_group_memories"
  | "participate_rankings"
  | "go_live"
  | "create_events"
  | "create_performances"
  | "upload_songs"
  | "upload_videos"
  | "upload_beats"
  | "upload_instrumentals"
  | "sell_merchandise"
  | "receive_tips"
  | "run_memberships"
  | "create_battles"
  | "create_cyphers"
  | "create_challenges"
  | "broadcast_playlists"
  | "submit_billboard"
  | "submit_magazine"
  | "manage_seating"
  | "create_ticket_inventory"
  | "sell_ticket_inventory"
  | "validate_tickets"
  | "create_venue_advertisements"
  | "promote_events"
  | "promote_performers"
  | "promote_venues"
  | "create_campaigns"
  | "manage_outreach"
  | "track_conversions"
  | "manage_affiliate_links"
  | "publish_articles"
  | "publish_interviews"
  | "publish_reviews"
  | "create_magazine_content"
  | "create_monthly_issues"
  | "cover_events"
  | "cover_performers"
  | "cover_venues"
  | "submit_ranking_recommendations"
  | "sell_beats"
  | "lease_beats"
  | "collaborate"
  | "submit_music"
  | "submit_artists"
  | "purchase_ads"
  | "upload_ad_creatives"
  | "manage_ad_budgets"
  | "view_campaign_analytics"
  | "target_audiences"
  | "sponsor_performers"
  | "sponsor_battles"
  | "sponsor_cyphers"
  | "sponsor_contests"
  | "sponsor_venues"
  | "sponsor_events"
  | "create_giveaways"
  | "create_rewards"
  | "moderate"
  | "verify"
  | "review"
  | "support"
  | "audit"
  | "investigate_reports"
  | "manage_content"
  | "final_approval"
  | "final_publishing"
  | "final_ranking_approval"
  | "final_sponsorship_approval"
  | "final_platform_configuration"
  | "final_moderation_authority"
  | "monitor_systems"
  | "monitor_revenue"
  | "monitor_growth"
  | "monitor_health"
  | "recommend_actions"
  | "run_automations"
  | "run_audits"
  | "run_forecasts";

export type AuthorityScope = "owner" | "access" | "view" | "edit" | "approve";

export interface RoleAuthority {
  role: TMIRole | SpecialAuthorityRole;
  purpose: string;
  coreFeatures: CoreFeature[];
  can: RoleCapability[];
  cannot: RoleCapability[];
}

export const UNIVERSAL_CORE_FEATURES: CoreFeature[] = [
  "profile",
  "avatar",
  "cover_image",
  "article_image",
  "memory_wall",
  "messaging",
  "notifications",
  "playlist",
  "camera",
  "video_panels",
  "image_wallet",
  "search",
  "friends_followers",
  "settings",
  "membership_management",
];

const CANONICAL_ROLE_AUTHORITY: Readonly<Record<TMIRole | SpecialAuthorityRole, RoleAuthority>> = {
  FAN: {
    role: "FAN",
    purpose: "Consume, discover, support, and socialize.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "follow_accounts",
      "build_playlists",
      "join_rooms",
      "join_audiences",
      "buy_tickets",
      "tip_performers",
      "buy_memberships",
      "buy_merchandise",
      "join_contests",
      "join_games",
      "join_challenges",
      "join_fan_lobbies",
      "upload_photos",
      "upload_memories",
      "create_group_memories",
      "participate_rankings",
    ],
    cannot: [
      "create_venue_advertisements",
      "create_campaigns",
      "sell_ticket_inventory",
      "create_battles",
      "create_cyphers",
      "create_challenges",
    ],
  },
  PERFORMER: {
    role: "PERFORMER",
    purpose: "Create, perform, and monetize.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "go_live",
      "create_events",
      "create_performances",
      "upload_songs",
      "upload_videos",
      "upload_beats",
      "upload_instrumentals",
      "sell_merchandise",
      "receive_tips",
      "run_memberships",
      "create_battles",
      "create_cyphers",
      "create_challenges",
      "build_playlists",
      "broadcast_playlists",
      "submit_billboard",
      "submit_magazine",
    ],
    cannot: [
      "final_ranking_approval",
      "final_sponsorship_approval",
      "manage_seating",
      "create_ticket_inventory",
      "sell_ticket_inventory",
    ],
  },
  ARTIST: {
    role: "ARTIST",
    purpose: "Create and distribute artist content.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "go_live",
      "create_events",
      "create_performances",
      "upload_songs",
      "upload_videos",
      "upload_beats",
      "upload_instrumentals",
      "sell_merchandise",
      "receive_tips",
      "run_memberships",
      "build_playlists",
      "broadcast_playlists",
      "submit_billboard",
      "submit_magazine",
    ],
    cannot: [
      "final_ranking_approval",
      "final_sponsorship_approval",
      "manage_seating",
      "create_ticket_inventory",
      "sell_ticket_inventory",
    ],
  },
  PRODUCER: {
    role: "PRODUCER",
    purpose: "Music production, licensing, and creator collaboration.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "upload_beats",
      "upload_instrumentals",
      "sell_beats",
      "lease_beats",
      "collaborate",
      "submit_music",
      "submit_artists",
      "participate_rankings",
      "build_playlists",
    ],
    cannot: ["final_ranking_approval", "manage_seating", "manage_ad_budgets"],
  },
  VENUE: {
    role: "VENUE",
    purpose: "Host events and own ticket inventory operations.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "create_events",
      "manage_seating",
      "create_ticket_inventory",
      "sell_ticket_inventory",
      "validate_tickets",
      "create_venue_advertisements",
    ],
    cannot: ["submit_billboard", "final_ranking_approval", "final_platform_configuration"],
  },
  PROMOTER: {
    role: "PROMOTER",
    purpose: "Drive event attendance and campaign outcomes.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "promote_events",
      "promote_performers",
      "promote_venues",
      "create_campaigns",
      "manage_outreach",
      "track_conversions",
      "manage_affiliate_links",
      "create_ticket_inventory",
      "sell_ticket_inventory",
    ],
    cannot: ["manage_seating", "manage_content", "final_ranking_approval"],
  },
  WRITER: {
    role: "WRITER",
    purpose: "Editorial and journalism publishing.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "publish_articles",
      "publish_interviews",
      "publish_reviews",
      "create_magazine_content",
      "create_monthly_issues",
      "cover_events",
      "cover_performers",
      "cover_venues",
      "submit_ranking_recommendations",
    ],
    cannot: ["final_ranking_approval", "verify", "final_sponsorship_approval"],
  },
  SPONSOR: {
    role: "SPONSOR",
    purpose: "Fund activities and create rewards.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "sponsor_performers",
      "sponsor_battles",
      "sponsor_cyphers",
      "sponsor_contests",
      "sponsor_venues",
      "sponsor_events",
      "create_giveaways",
      "create_rewards",
      "create_campaigns",
    ],
    cannot: ["final_ranking_approval", "final_platform_configuration", "moderate"],
  },
  ADVERTISER: {
    role: "ADVERTISER",
    purpose: "Buy exposure and run ad campaigns.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "purchase_ads",
      "upload_ad_creatives",
      "create_campaigns",
      "manage_ad_budgets",
      "view_campaign_analytics",
      "target_audiences",
    ],
    cannot: ["manage_seating", "create_performances", "moderate"],
  },
  ADMIN: {
    role: "ADMIN",
    purpose: "Operations, moderation, and governance.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: ["moderate", "verify", "review", "support", "audit", "investigate_reports", "manage_content"],
    cannot: ["final_platform_configuration", "final_approval"],
  },
  STAFF: {
    role: "STAFF",
    purpose: "Operational support under admin governance.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: ["review", "support", "audit", "investigate_reports"],
    cannot: ["final_platform_configuration", "final_approval", "final_moderation_authority"],
  },
  MUSIC_DIRECTOR: {
    role: "MUSIC_DIRECTOR",
    purpose: "Curate music, rankings recommendations, and feature guidance.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "upload_songs",
      "upload_beats",
      "build_playlists",
      "submit_ranking_recommendations",
      "recommend_actions",
      "submit_artists",
      "submit_music",
    ],
    cannot: ["final_approval", "final_platform_configuration", "publish_articles"],
  },
  OWNER_EXECUTIVE_DIRECTOR: {
    role: "OWNER_EXECUTIVE_DIRECTOR",
    purpose: "Final platform authority.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "final_approval",
      "final_publishing",
      "final_ranking_approval",
      "final_sponsorship_approval",
      "final_platform_configuration",
      "final_moderation_authority",
    ],
    cannot: [],
  },
  EXECUTIVE_AI: {
    role: "EXECUTIVE_AI",
    purpose: "Automated monitoring, forecasting, and recommendations.",
    coreFeatures: UNIVERSAL_CORE_FEATURES,
    can: [
      "monitor_systems",
      "monitor_revenue",
      "monitor_growth",
      "monitor_health",
      "recommend_actions",
      "run_automations",
      "run_audits",
      "run_forecasts",
    ],
    cannot: ["final_platform_configuration", "final_approval", "final_publishing"],
  },
};

export function getRoleAuthority(role: TMIRole | SpecialAuthorityRole): RoleAuthority {
  return CANONICAL_ROLE_AUTHORITY[role];
}

export function roleCan(role: TMIRole | SpecialAuthorityRole, capability: RoleCapability): boolean {
  return CANONICAL_ROLE_AUTHORITY[role].can.includes(capability);
}

export function roleCannot(role: TMIRole | SpecialAuthorityRole, capability: RoleCapability): boolean {
  return CANONICAL_ROLE_AUTHORITY[role].cannot.includes(capability);
}

export function getAllRoleAuthorities(): RoleAuthority[] {
  return Object.values(CANONICAL_ROLE_AUTHORITY);
}

export interface FeatureAuthority {
  feature: RoleCapability;
  owner: Array<TMIRole | SpecialAuthorityRole>;
  access: Array<TMIRole | SpecialAuthorityRole>;
  view: Array<TMIRole | SpecialAuthorityRole>;
  edit: Array<TMIRole | SpecialAuthorityRole>;
  approve: Array<TMIRole | SpecialAuthorityRole>;
}

export const FEATURE_AUTHORITY_MATRIX: FeatureAuthority[] = [
  {
    feature: "create_ticket_inventory",
    owner: ["VENUE", "PROMOTER"],
    access: ["VENUE", "PROMOTER", "ADMIN", "STAFF", "OWNER_EXECUTIVE_DIRECTOR"],
    view: ["FAN", "PERFORMER", "ARTIST", "VENUE", "PROMOTER", "ADMIN", "STAFF"],
    edit: ["VENUE", "PROMOTER", "ADMIN"],
    approve: ["ADMIN", "OWNER_EXECUTIVE_DIRECTOR"],
  },
  {
    feature: "sell_ticket_inventory",
    owner: ["VENUE", "PROMOTER"],
    access: ["VENUE", "PROMOTER", "ADMIN", "OWNER_EXECUTIVE_DIRECTOR"],
    view: ["FAN", "PERFORMER", "ARTIST", "VENUE", "PROMOTER", "ADMIN", "STAFF"],
    edit: ["VENUE", "PROMOTER", "ADMIN"],
    approve: ["ADMIN", "OWNER_EXECUTIVE_DIRECTOR"],
  },
  {
    feature: "create_campaigns",
    owner: ["ADVERTISER", "SPONSOR", "PROMOTER"],
    access: ["ADVERTISER", "SPONSOR", "PROMOTER", "ADMIN", "STAFF", "OWNER_EXECUTIVE_DIRECTOR"],
    view: ["ADVERTISER", "SPONSOR", "PROMOTER", "ADMIN", "STAFF"],
    edit: ["ADVERTISER", "SPONSOR", "PROMOTER", "ADMIN"],
    approve: ["ADMIN", "OWNER_EXECUTIVE_DIRECTOR"],
  },
  {
    feature: "submit_ranking_recommendations",
    owner: ["WRITER", "MUSIC_DIRECTOR"],
    access: ["WRITER", "MUSIC_DIRECTOR", "PERFORMER", "ARTIST", "ADMIN", "OWNER_EXECUTIVE_DIRECTOR"],
    view: ["WRITER", "MUSIC_DIRECTOR", "ADMIN", "OWNER_EXECUTIVE_DIRECTOR"],
    edit: ["WRITER", "MUSIC_DIRECTOR", "ADMIN"],
    approve: ["OWNER_EXECUTIVE_DIRECTOR"],
  },
  {
    feature: "final_platform_configuration",
    owner: ["OWNER_EXECUTIVE_DIRECTOR"],
    access: ["OWNER_EXECUTIVE_DIRECTOR", "ADMIN"],
    view: ["OWNER_EXECUTIVE_DIRECTOR", "ADMIN"],
    edit: ["OWNER_EXECUTIVE_DIRECTOR"],
    approve: ["OWNER_EXECUTIVE_DIRECTOR"],
  },
];

export function getFeatureAuthority(feature: RoleCapability): FeatureAuthority | null {
  return FEATURE_AUTHORITY_MATRIX.find((entry) => entry.feature === feature) ?? null;
}
