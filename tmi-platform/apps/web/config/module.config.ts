import type { ModuleConfig } from "@tmi/module-runtime";

/**
 * TMI (The Musicians Index) module config.
 * This module owns: advertiser, sponsor, booking, ticketing, NFT,
 * billboard, venue, ranking, cypher, magazine, arena, fan engines.
 * It does NOT own: Law Bubble, XXL, ThunderWorld, etc. — those are extracted.
 */
export const MODULE_CONFIG: ModuleConfig = {
  id: "web",
  name: "The Musicians Index",
  version: "1.0.0",
  domain: "themusiciansindex.com",
  port: 3000,
  runtime: {
    maxMemoryMb: 1024,
    maxQueueDepth: 5000,
    healthCheckIntervalMs: 15_000,
    checkpointIntervalMs: 60_000,
  },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode:
      (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.3),
  },
  isolation: {
    allowedOrigins: [
      "https://themusiciansindex.com",
      "https://law.berntout.com",
      "https://berntout.com",
    ],
    requireAuthFor: [
      "/api/booking/*",
      "/api/nft/mint",
      "/api/admin/*",
      "/api/ticketing/admin/*",
    ],
  },
  contracts: {
    emits: [
      "tmi.artist.referral",
      "tmi.session.active",
      "tmi.media.contract",
      "tmi.venue.event",
      "tmi.ranking.updated",
      "tmi.booking.confirmed",
    ],
    consumes: [
      "law.referral.received",
      "stream.stats.reported",
      "charge.session.started",
      "xxl.runtime.status",
    ],
  },
};

/**
 * TMI-specific logic behaviors for LogicStimulator.
 * All relate to TMI-native engines — no extracted product logic here.
 */
export const TMI_LOGIC_BEHAVIORS = [
  // Magazine
  "homepage.rotate_articles",
  "homepage.top10_update",
  "magazine.article_load",
  "magazine.issue_render",
  "magazine.snippet_rotate",
  // Rankings
  "ranking.artist_move",
  "ranking.crown_assign",
  "ranking.leaderboard_update",
  "ranking.reset",
  // Booking
  "booking.request",
  "booking.accept",
  "booking.cancel",
  "booking.payment",
  // Ticketing
  "ticketing.sale",
  "ticketing.scan",
  "ticketing.sold_out",
  "ticketing.fraud_check",
  // NFT
  "nft.drop",
  "nft.mint",
  "nft.transfer",
  // Billboard
  "billboard.rotation",
  "billboard.impression",
  "billboard.ctr",
  // Sponsor
  "sponsor.placement_rotate",
  "sponsor.impression",
  "sponsor.reward",
  // Venue
  "venue.capacity_check",
  "venue.shard_overflow",
  "venue.show_start",
  // Cypher
  "cypher.battle_start",
  "cypher.vote_cast",
  "cypher.winner_crown",
  // Fan
  "fan.friend_request",
  "fan.tip_send",
  "fan.vote",
];
