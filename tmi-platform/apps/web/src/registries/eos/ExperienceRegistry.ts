/**
 * EOS Experience Registry — blueprint folders as interactive module definitions.
 * Every experience must pass RuntimeValidator before StageLoader mounts it.
 */

import type { ExperienceDefinition } from "@/core/eos/types";

const DEFAULT_PERMS = {
  fan: true,
  performer: true,
  admin: true,
} as const;

export const EXPERIENCE_REGISTRY: Record<string, ExperienceDefinition> = {
  battle: {
    id: "battle",
    title: "Battle Arena",
    category: "BATTLE",
    venueId: "battle",
    environmentId: "battle_arena_v1",
    lightingId: "gold_spotlight",
    cameraPackId: "battle_standard",
    audienceId: "arena_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "voting_panel",
      "leaderboard",
      "crowd_meter",
      "round_timer",
      "vs_overlay",
      "round_banner",
      "results_overlay",
      "audience_reaction_bar",
      "sponsor_rail",
      "discovery_rail",
    ],
    overlayIds: ["battle_status", "vs_overlay", "round_banner", "results_overlay"],
    animationPackId: "battle_transitions",
    themeId: "cyber-neon",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: ["competition_presentation", "cis_integrity", "daily_webrtc"],
    version: "1.0.0",
    entryRoute: "/battles/live",
  },

  cypher: {
    id: "cypher",
    title: "Cypher Circle",
    category: "CYPHER",
    venueId: "cypher",
    environmentId: "cypher_circle_v1",
    lightingId: "purple_theater_grid",
    cameraPackId: "cypher_standard",
    audienceId: "circle_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "queue_system",
      "beat_player",
      "mic_control",
      "audience_reaction_bar",
      "cypher_status",
      "round_timer",
      "crowd_meter",
      "discovery_rail",
    ],
    overlayIds: ["mic_control", "audience_reaction_bar"],
    animationPackId: "cypher_transitions",
    themeId: "cypher-vice",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: ["competition_presentation", "open_queue"],
    version: "1.0.0",
    entryRoute: "/cypher/stage",
  },

  //
  // VOCAL IMPROV (Phase 4.7) — category BATTLE; mode via featureFlags only
  // (ExperienceDefinition has no subCategory field — do not break RuntimeValidator).
  // venueId reuses battle (VenueAssetRegistry) — no invented jazz_club ID.
  // Camera/animation packs reuse battle_standard / battle_transitions.
  // Scoring profile ids: scoring:jazz_scat_v1 | scoring:gibberish_v1
  //
  "jazz-scat-battle": {
    id: "jazz-scat-battle",
    title: "Jazz Scat Battle",
    category: "BATTLE",
    venueId: "battle",
    environmentId: "battle_arena_v1",
    lightingId: "gold_spotlight",
    cameraPackId: "battle_standard",
    audienceId: "arena_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "voting_panel",
      "leaderboard",
      "vocal_meter",
      "crowd_meter",
      "round_timer",
      "vs_overlay",
      "round_banner",
      "results_overlay",
      "audience_reaction_bar",
      "sponsor_rail",
      "discovery_rail",
    ],
    overlayIds: ["battle_status", "vs_overlay", "round_banner", "results_overlay"],
    animationPackId: "battle_transitions",
    themeId: "cyber-neon",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: [
      "competition_presentation",
      "cis_integrity",
      "vocal_improv",
      "jazz_scat",
      "scoring:jazz_scat_v1",
    ],
    version: "1.0.0",
    entryRoute: "/battles/jazz-scat",
  },

  "gibberish-battle": {
    id: "gibberish-battle",
    title: "Gibberish Battle",
    category: "BATTLE",
    venueId: "battle",
    environmentId: "battle_arena_v1",
    lightingId: "gold_spotlight",
    cameraPackId: "battle_standard",
    audienceId: "arena_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "voting_panel",
      "leaderboard",
      "vocal_meter",
      "crowd_meter",
      "round_timer",
      "vs_overlay",
      "round_banner",
      "results_overlay",
      "audience_reaction_bar",
      "sponsor_rail",
      "discovery_rail",
    ],
    overlayIds: ["battle_status", "vs_overlay", "round_banner", "results_overlay"],
    animationPackId: "battle_transitions",
    themeId: "cyber-neon",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: [
      "competition_presentation",
      "cis_integrity",
      "vocal_improv",
      "gibberish",
      "scoring:gibberish_v1",
    ],
    version: "1.0.0",
    entryRoute: "/battles/gibberish",
  },

  challenge: {
    id: "challenge",
    title: "Challenge Arena",
    category: "CHALLENGE",
    venueId: "challenge",
    environmentId: "challenge_arena_v1",
    lightingId: "cyan_outdoor_rig",
    cameraPackId: "challenge_standard",
    audienceId: "theater_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "leaderboard",
      "round_timer",
      "round_banner",
      "results_overlay",
      "crowd_meter",
      "discovery_rail",
    ],
    overlayIds: ["round_banner", "results_overlay"],
    animationPackId: "challenge_transitions",
    themeId: "challenge-gold",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: ["competition_presentation", "cis_integrity"],
    version: "1.0.0",
    entryRoute: "/challenge/stage",
  },

  lounge: {
    id: "lounge",
    title: "VIP Video Lounge",
    category: "LOUNGE",
    venueId: "lounge",
    environmentId: "video_window_lounge_v1",
    lightingId: "club_soft",
    cameraPackId: "lounge_standard",
    audienceId: "presence_slots",
    avatarMode: "presence_frame",
    widgetIds: ["presence_frame", "mic_control", "discovery_rail"],
    overlayIds: [],
    animationPackId: "lounge_transitions",
    themeId: "tmi-theater",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: ["presence_frame_economy", "no_walking_feet"],
    version: "1.0.0",
    entryRoute: "/rooms/vip-lounge",
  },

  "world-dance-party": {
    id: "world-dance-party",
    title: "World Dance Party",
    category: "DANCE_PARTY",
    venueId: "world-dance-party",
    environmentId: "full_body_dance_v1",
    lightingId: "dj_strobe_lasers",
    cameraPackId: "dance_party_standard",
    audienceId: "dance_floor_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "dj_booth",
      "money_cannon",
      "crowd_meter",
      "audience_reaction_bar",
      "sponsor_rail",
      "discovery_rail",
    ],
    overlayIds: [],
    animationPackId: "dance_transitions",
    themeId: "nightclub-vice",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: ["full_body_avatar", "venue_skin_picker", "bot_human_parity"],
    version: "1.0.0",
    entryRoute: "/rooms/world-dance-party",
  },

  "fan-lobby": {
    id: "fan-lobby",
    title: "Fan Avatar Lobby",
    category: "FAN_LOBBY",
    venueId: "fan-lobby",
    environmentId: "fan_pre_show_lobby_v1",
    lightingId: "lobby_warm",
    cameraPackId: "fan_lobby_standard",
    audienceId: "friend_clusters",
    avatarMode: "interactive",
    widgetIds: [
      "popcorn_machine",
      "mic_control",
      "audience_reaction_bar",
      "discovery_rail",
    ],
    overlayIds: [],
    animationPackId: "fan_lobby_transitions",
    networkMode: "WebRTC",
    permissions: { fan: true, performer: false, admin: true },
    featureFlags: ["video_popover", "prop_sync", "lobby_skins"],
    version: "1.0.0",
    entryRoute: "/rooms/fan-lobby",
  },

  //
  // BROADCAST SHOWCASE PROFILE
  // Monday Night Stage — weekly flagship live showcase.
  // Inspired by Showtime at the Apollo / Star Search energy.
  // Performers entertain a live audience; fans react, tip, follow, and book.
  // This is NOT a competition: no Challenger/Defender, no SCOREBOARD.
  //
  "monday-night-stage": {
    id: "monday-night-stage",
    title: "Monday Night Stage",
    // Broadcast Showcase Profile — STAGE_SHOW keeps RoleRegistry access;
    // LIVE_SHOWCASE is also allowed in RoleRegistry for future profile splits.
    category: "STAGE_SHOW",
    venueId: "monday-night-stage",
    environmentId: "apollo_stage_v1",
    lightingId: "theater_gold",
    cameraPackId: "stage_show_standard",
    audienceId: "theater_mesh",
    avatarMode: "interactive",
    //
    // Widget stack — Broadcast Showcase Profile
    // Broadcast:   broadcast_controls, stream_status, show_timer
    // Audience:    crowd_meter, boo_meter, applause_meter, live_chat, audience_reaction_bar, voting_panel
    // Show:        performer_card, coming_up_next, sponsor_rail, discovery_rail
    // Discovery:   follow_artist, book_artist, tip_performer
    //
    widgetIds: [
      // Broadcast
      "broadcast_controls",
      "stream_status",
      "show_timer",
      // Audience
      "crowd_meter",
      "boo_meter",
      "applause_meter",
      "live_chat",
      "audience_reaction_bar",
      "voting_panel",
      // Show
      "performer_card",
      "coming_up_next",
      "sponsor_rail",
      "discovery_rail",
      // Discovery / monetisation
      "follow_artist",
      "book_artist",
      "tip_performer",
    ],
    overlayIds: ["show_title", "live_badge", "performer_card"],
    animationPackId: "stage_show_transitions",
    themeId: "stage-show-gold",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: [
      "live_showcase",
      "bebo_hook",
      "official_event",
      "tip_live",
      "booking_discovery",
      "highlight_clips",
    ],
    version: "2.0.0",
    entryRoute: "/shows/monday-night-stage",
  },

  "deal-or-feud": {
    id: "deal-or-feud",
    title: "Deal or Feud 1000",
    category: "GAME_SHOW",
    venueId: "deal-or-feud",
    environmentId: "gameshow_studio_v1",
    lightingId: "studio_grid",
    cameraPackId: "game_show_standard",
    audienceId: "theater_mesh",
    avatarMode: "interactive",
    widgetIds: [
      "door_picker",
      "prize_panel",
      "crowd_meter",
      "sponsor_rail",
      "discovery_rail",
    ],
    overlayIds: [],
    animationPackId: "game_show_transitions",
    networkMode: "WebRTC",
    permissions: DEFAULT_PERMS,
    featureFlags: ["costume_loadout", "points_entry"],
    version: "1.0.0",
    entryRoute: "/shows/deal-or-feud",
  },

  /** Minimal test experience for EOS boot certification */
  test: {
    id: "test",
    title: "EOS Test Experience",
    category: "TEST",
    venueId: "lounge",
    environmentId: "test_env",
    lightingId: "default",
    cameraPackId: "lounge_standard",
    audienceId: "test_audience",
    avatarMode: "none",
    widgetIds: ["discovery_rail"],
    overlayIds: [],
    animationPackId: "default_transitions",
    networkMode: "Socket",
    permissions: { fan: true, performer: true, admin: true },
    featureFlags: ["eos_certification"],
    version: "1.0.0",
    entryRoute: "/explore",
  },
};

export function getExperienceById(id: string): ExperienceDefinition | undefined {
  return EXPERIENCE_REGISTRY[id];
}

export function getAllExperiences(): ExperienceDefinition[] {
  return Object.values(EXPERIENCE_REGISTRY);
}

export function getExperiencesForRole(role: "fan" | "performer" | "admin"): ExperienceDefinition[] {
  return getAllExperiences().filter((exp) => {
    if (role === "fan") return exp.permissions.fan;
    if (role === "performer") return exp.permissions.performer;
    return exp.permissions.admin;
  });
}
