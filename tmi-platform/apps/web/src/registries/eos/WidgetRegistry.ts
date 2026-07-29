/**
 * EOS Widget Registry — shared functional overlays composed by experiences.
 * Rule 8: one widget definition; experiences reference by ID.
 */

import type { ExperienceCategory, WidgetDefinition } from "@/core/eos/types";

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  voting_panel: {
    id: "voting_panel",
    displayName: "Voting Panel",
    layer: "panel",
    componentPath: "@/components/competition/presentation/CompetitionScoreboard",
    requiredForCategories: ["BATTLE"],
  },
  leaderboard: {
    id: "leaderboard",
    displayName: "Leaderboard",
    layer: "hud",
    componentPath: "@/components/competition/presentation/CompetitionScoreboard",
    requiredForCategories: ["BATTLE", "CHALLENGE"],
  },
  boo_meter: {
    id: "boo_meter",
    displayName: "Boo / Cheer Meter",
    layer: "hud",
    requiredForCategories: ["STAGE_SHOW"],
  },
  crowd_meter: {
    id: "crowd_meter",
    displayName: "Crowd Energy Meter",
    layer: "hud",
    componentPath: "@/components/competition/presentation/CompetitionCrowdMeter",
    requiredForCategories: ["BATTLE", "STAGE_SHOW"],
  },
  /** Vocal Improv pitch/energy HUD — pitch engine not wired yet (Rule 20 honest pending). */
  vocal_meter: {
    id: "vocal_meter",
    displayName: "Vocal Meter",
    layer: "hud",
    componentPath: "@/components/competition/presentation/CompetitionCrowdMeter",
  },
  round_timer: {
    id: "round_timer",
    displayName: "Round Timer",
    layer: "overlay",
    componentPath: "@/components/competition/presentation/CompetitionTimer",
    requiredForCategories: ["CHALLENGE", "BATTLE", "CYPHER"],
  },
  battle_status: {
    id: "battle_status",
    displayName: "Battle Status HUD",
    layer: "hud",
    componentPath: "@/components/competition/presentation/CompetitionHUD",
  },
  vs_overlay: {
    id: "vs_overlay",
    displayName: "VS Clash Overlay",
    layer: "overlay",
    componentPath: "@/components/competition/presentation/CompetitionVSOverlay",
  },
  round_banner: {
    id: "round_banner",
    displayName: "Round Banner",
    layer: "overlay",
    componentPath: "@/components/competition/presentation/CompetitionRoundBanner",
  },
  results_overlay: {
    id: "results_overlay",
    displayName: "Results Overlay",
    layer: "overlay",
    componentPath: "@/components/competition/presentation/CompetitionResultsOverlay",
  },
  queue_system: {
    id: "queue_system",
    displayName: "Cypher Queue",
    layer: "panel",
    componentPath: "@/components/eos/widgets/CypherQueuePanel",
    requiredForCategories: ["CYPHER"],
  },
  mic_control: {
    id: "mic_control",
    displayName: "Mic Control",
    layer: "overlay",
    requiredForCategories: ["CYPHER"],
  },
  beat_player: {
    id: "beat_player",
    displayName: "Beat Player",
    layer: "panel",
    componentPath: "@/components/eos/widgets/CypherBeatPlayer",
    requiredForCategories: ["CYPHER"],
  },
  cypher_status: {
    id: "cypher_status",
    displayName: "Cypher Status HUD",
    layer: "hud",
    componentPath: "@/components/eos/widgets/CypherStatusHUD",
    requiredForCategories: ["CYPHER"],
  },
  presence_frame: {
    id: "presence_frame",
    displayName: "Presence Frame Shell",
    layer: "panel",
    componentPath: "@/registries/presence/PresenceFrameRegistry",
    requiredForCategories: ["LOUNGE"],
  },
  dj_booth: {
    id: "dj_booth",
    displayName: "DJ Booth Monitor",
    layer: "hud",
    requiredForCategories: ["DANCE_PARTY"],
  },
  money_cannon: {
    id: "money_cannon",
    displayName: "Money Cannon Prop",
    layer: "ambient",
  },
  popcorn_machine: {
    id: "popcorn_machine",
    displayName: "Popcorn Machine",
    layer: "ambient",
  },
  prize_panel: {
    id: "prize_panel",
    displayName: "Prize Panel",
    layer: "panel",
    requiredForCategories: ["GAME_SHOW"],
  },
  door_picker: {
    id: "door_picker",
    displayName: "Deal Door Picker",
    layer: "panel",
    componentPath: "@/components/tmi/games/DealVsFeud1000",
    requiredForCategories: ["GAME_SHOW"],
  },
  audience_reaction_bar: {
    id: "audience_reaction_bar",
    displayName: "Audience Reaction Bar",
    layer: "overlay",
    componentPath: "@/components/live/AudienceReactionBar",
    requiredForCategories: ["CYPHER", "BATTLE"],
  },
  sponsor_rail: {
    id: "sponsor_rail",
    displayName: "Sponsor Rail",
    layer: "panel",
    componentPath: "@/components/ads/UnifiedAdSlot",
  },
  discovery_rail: {
    id: "discovery_rail",
    displayName: "Discovery Rail",
    layer: "panel",
    componentPath: "@/components/discovery/DiscoveryRail",
  },

  // ── Broadcast / Live Showcase widgets (Monday Night Stage + future stage shows) ──

  // Broadcast group
  broadcast_controls: {
    id: "broadcast_controls",
    displayName: "Broadcast Controls",
    layer: "panel",
    requiredForCategories: ["LIVE_SHOWCASE", "STAGE_SHOW"],
  },
  stream_status: {
    id: "stream_status",
    displayName: "Stream Status HUD",
    layer: "hud",
    requiredForCategories: ["LIVE_SHOWCASE", "STAGE_SHOW"],
  },
  show_timer: {
    id: "show_timer",
    displayName: "Show Timer",
    layer: "hud",
    requiredForCategories: ["LIVE_SHOWCASE", "STAGE_SHOW"],
  },

  // Audience group
  live_chat: {
    id: "live_chat",
    displayName: "Live Chat",
    layer: "panel",
  },
  applause_meter: {
    id: "applause_meter",
    displayName: "Applause Meter",
    layer: "hud",
    requiredForCategories: ["LIVE_SHOWCASE"],
  },

  // Show group
  performer_card: {
    id: "performer_card",
    displayName: "Performer Card \u2014 Now Performing",
    layer: "overlay",
    requiredForCategories: ["LIVE_SHOWCASE"],
  },
  coming_up_next: {
    id: "coming_up_next",
    displayName: "Coming Up Next",
    layer: "panel",
    requiredForCategories: ["LIVE_SHOWCASE"],
  },

  // Overlay / identity group
  show_title: {
    id: "show_title",
    displayName: "Show Title Overlay",
    layer: "overlay",
    requiredForCategories: ["LIVE_SHOWCASE"],
  },
  live_badge: {
    id: "live_badge",
    displayName: "Live Badge Indicator",
    layer: "overlay",
  },

  // Discovery / monetisation group
  follow_artist: {
    id: "follow_artist",
    displayName: "Follow Artist",
    layer: "panel",
  },
  book_artist: {
    id: "book_artist",
    displayName: "Book Artist",
    layer: "panel",
  },
  tip_performer: {
    id: "tip_performer",
    displayName: "Tip Performer (Live)",
    layer: "panel",
  },
};

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY[id];
}

export function getWidgetsForExperience(widgetIds: string[]): WidgetDefinition[] {
  return widgetIds.map((id) => WIDGET_REGISTRY[id]).filter(Boolean) as WidgetDefinition[];
}

export function getWidgetsForCategory(category: ExperienceCategory): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY).filter((w) =>
    w.requiredForCategories?.includes(category)
  );
}
