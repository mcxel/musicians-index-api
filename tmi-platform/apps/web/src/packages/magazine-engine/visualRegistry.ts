import type { IssueZoneKey } from "./zoneMaps";

/**
 * Slice 6.5 visual component registry.
 * Keeps every surface discoverable and prevents floating visual modules.
 */
export const visualRegistry = {
  frames: {
    neon: "NeonFrame",
    magazine: "MagazineFrame",
    stage: "StageFrame",
    billboard: "BillboardFrame",
  },
  shells: {
    venue: "VenueSkinShell",
    video: "LiveVideoShell",
  },
  widgets: {
    reactionBar: "ReactionBar",
    sponsor: "SponsorSpotlightFrame",
    article: "ArticleFeatureCard",
    gameBoard: "NameThatTuneBoard",
  },
  shapes: {
    hex: "HexCluster",
    angled: "AngledPanel",
  },
  overlays: {
    reactions: "ReactionOverlayCanvas",
  },
} as const;

export type VisualComponentName =
  | (typeof visualRegistry.frames)[keyof typeof visualRegistry.frames]
  | (typeof visualRegistry.shells)[keyof typeof visualRegistry.shells]
  | (typeof visualRegistry.widgets)[keyof typeof visualRegistry.widgets]
  | (typeof visualRegistry.shapes)[keyof typeof visualRegistry.shapes]
  | (typeof visualRegistry.overlays)[keyof typeof visualRegistry.overlays];

export const zoneVisualBindings: Record<IssueZoneKey, readonly VisualComponentName[]> = {
  coverFront: ["BillboardFrame", "MagazineFrame"],
  topTenLoop: ["NeonFrame"],
  editorial: ["MagazineFrame", "ArticleFeatureCard"],
  discovery: ["NeonFrame"],
  charts: ["NeonFrame"],
  liveRooms: ["VenueSkinShell", "StageFrame", "LiveVideoShell", "ReactionBar"],
  events: ["StageFrame", "AngledPanel"],
  cyphers: ["StageFrame", "NameThatTuneBoard"],
  featuredGame: ["StageFrame"],
  gameSelector: ["HexCluster", "NeonFrame"],
  eventTracker: ["AngledPanel"],
  prizePool: ["BillboardFrame"],
  sponsorSpotlight: ["SponsorSpotlightFrame"],
  adMarketplace: ["BillboardFrame"],
  analyticsDash: ["AngledPanel"],
  globalRankLoop: ["NeonFrame"],
  risingStars: ["NeonFrame"],
  genreLeaderboards: ["HexCluster", "NeonFrame"],
  idolStage: ["StageFrame", "LiveVideoShell"],
  idolJudges: ["AngledPanel", "ReactionBar"],
  idolAudience: ["ReactionOverlayCanvas"],
  danceFloor: ["VenueSkinShell", "ReactionOverlayCanvas"],
  djBooth: ["StageFrame", "LiveVideoShell"],
  producerSpotlight: ["BillboardFrame"],
  battleRing: ["StageFrame"],
  cypherHost: ["LiveVideoShell"],
  challengerQueue: ["NeonFrame"],
  feudBoard: ["NameThatTuneBoard"],
  feudPodiums: ["StageFrame"],
  feudCrowd: ["ReactionOverlayCanvas"],
  squaresGrid: ["NameThatTuneBoard"],
  squaresHost: ["LiveVideoShell"],
  squaresContestants: ["NeonFrame"],
  roastStage: ["StageFrame"],
  roastScore: ["AngledPanel"],
  roastCrowd: ["ReactionOverlayCanvas"],
  rewardsLedger: ["AngledPanel"],
  storeShowcase: ["BillboardFrame"],
  seasonPass: ["NeonFrame"],
  sponsorGiveaways: ["SponsorSpotlightFrame"],
  sponsorLeaderboard: ["NeonFrame"],
  dropCountdown: ["NeonFrame"],
  hallOfFame: ["BillboardFrame"],
  classicReplays: ["LiveVideoShell"],
  vaultArchive: ["MagazineFrame"]
};
