export type IssueZoneKey = 
  // Home 1
  | "coverFront" | "topTenLoop"
  // Home 2
  | "editorial" | "discovery" | "charts"
  // Home 3
  | "liveRooms" | "events" | "cyphers"
  // Home 4 (Game World)
  | "featuredGame" | "gameSelector" | "eventTracker" | "prizePool"
  // Home 5 (Marketplace)
  | "sponsorSpotlight" | "adMarketplace" | "analyticsDash"
  // Home 6 (Charts)
  | "globalRankLoop" | "risingStars" | "genreLeaderboards"
  // Home 7 (Monthly Idol)
  | "idolStage" | "idolJudges" | "idolAudience"
  // Home 8 (World Dance Party)
  | "danceFloor" | "djBooth" | "producerSpotlight"
  // Home 9 (Cyphers)
  | "battleRing" | "cypherHost" | "challengerQueue"
  // Home 10 (Deal or Feud)
  | "feudBoard" | "feudPodiums" | "feudCrowd"
  // Home 11 (Circles & Squares)
  | "squaresGrid" | "squaresHost" | "squaresContestants"
  // Home 12 (Dirty Dozens)
  | "roastStage" | "roastScore" | "roastCrowd"
  // Home 13 (Rewards)
  | "rewardsLedger" | "storeShowcase" | "seasonPass"
  // Home 14 (Sponsors)
  | "sponsorGiveaways" | "sponsorLeaderboard" | "dropCountdown"
  // Home 15 (Archive)
  | "hallOfFame" | "classicReplays" | "vaultArchive";

export const allIssueZones: IssueZoneKey[] = [
  "coverFront", "topTenLoop",
  "editorial", "discovery", "charts",
  "liveRooms", "events", "cyphers",
  "featuredGame", "gameSelector", "eventTracker", "prizePool",
  "sponsorSpotlight", "adMarketplace", "analyticsDash",
  "globalRankLoop", "risingStars", "genreLeaderboards",
  "idolStage", "idolJudges", "idolAudience",
  "danceFloor", "djBooth", "producerSpotlight",
  "battleRing", "cypherHost", "challengerQueue",
  "feudBoard", "feudPodiums", "feudCrowd",
  "squaresGrid", "squaresHost", "squaresContestants",
  "roastStage", "roastScore", "roastCrowd",
  "rewardsLedger", "storeShowcase", "seasonPass",
  "sponsorGiveaways", "sponsorLeaderboard", "dropCountdown",
  "hallOfFame", "classicReplays", "vaultArchive"
];

export type ZoneMapId = "home1" | "home2" | "home3" | "home4" | "home5" | "home6" | "home7" | "home8" | "home9" | "home10" | "home11" | "home12" | "home13" | "home14" | "home15";

export const zoneMaps: Record<ZoneMapId, IssueZoneKey[]> = {
  home1: ["coverFront"],
  home2: ["editorial", "discovery", "charts"],
  home3: ["liveRooms", "events", "cyphers"],
  home4: ["featuredGame", "gameSelector", "eventTracker", "prizePool"],
  home5: ["sponsorSpotlight", "adMarketplace", "analyticsDash"],
  home6: ["globalRankLoop", "risingStars", "genreLeaderboards"],
  home7: ["idolStage", "idolJudges", "idolAudience"],
  home8: ["danceFloor", "djBooth", "producerSpotlight"],
  home9: ["battleRing", "cypherHost", "challengerQueue"],
  home10: ["feudBoard", "feudPodiums", "feudCrowd"],
  home11: ["squaresGrid", "squaresHost", "squaresContestants"],
  home12: ["roastStage", "roastScore", "roastCrowd"],
  home13: ["rewardsLedger", "storeShowcase", "seasonPass"],
  home14: ["sponsorGiveaways", "sponsorLeaderboard", "dropCountdown"],
  home15: ["hallOfFame", "classicReplays", "vaultArchive"],
};

// Coordinates for CSS Grid Placement mapped to the 5-page Spread Spec
export const zonePlacements: Record<ZoneMapId, Partial<Record<IssueZoneKey, any>>> = {
  home1: {
    coverFront: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "print" },
    topTenLoop: { page: "left", colStart: 8, colSpan: 4, rowStart: 2, rowSpan: 10, frame: "neon" },
  },
  home2: {
    editorial: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "print" },
    discovery: { page: "right", colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 12, frame: "neon" },
    charts: { page: "left", colStart: 1, colSpan: 12, rowStart: 9, rowSpan: 4, frame: "neon" },
  },
  home3: {
    liveRooms: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "stage" },
    events: { page: "left", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "neon" },
    cyphers: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "stage" },
  },
  home4: {
    featuredGame: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "stage" },
    gameSelector: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "neon" },
    eventTracker: { page: "left", colStart: 1, colSpan: 12, rowStart: 9, rowSpan: 4, frame: "print" },
    prizePool: { page: "right", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "neon" },
  },
  home5: {
    sponsorSpotlight: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "print" },
    adMarketplace: { page: "left", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "neon" },
    analyticsDash: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "neon" },
  },
  home6: {
    globalRankLoop: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "neon" },
    risingStars: { page: "right", colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 12, frame: "neon" },
    genreLeaderboards: { page: "left", colStart: 1, colSpan: 12, rowStart: 9, rowSpan: 4, frame: "neon" },
  },
  home7: {
    idolStage: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "stage" },
    idolJudges: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "print" },
    idolAudience: { page: "right", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "stage" },
  },
  home8: {
    danceFloor: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "stage" },
    djBooth: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "neon" },
    producerSpotlight: { page: "right", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "print" },
  },
  home9: {
    battleRing: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "stage" },
    cypherHost: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "neon" },
    challengerQueue: { page: "left", colStart: 1, colSpan: 12, rowStart: 9, rowSpan: 4, frame: "neon" },
  },
  home10: {
    feudBoard: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "stage" },
    feudPodiums: { page: "left", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "print" },
    feudCrowd: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "stage" },
  },
  home11: {
    squaresGrid: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "stage" },
    squaresHost: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "print" },
    squaresContestants: { page: "right", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "neon" },
  },
  home12: {
    roastStage: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "stage" },
    roastScore: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "neon" },
    roastCrowd: { page: "right", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "stage" },
  },
  home13: {
    rewardsLedger: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "print" },
    storeShowcase: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "neon" },
    seasonPass: { page: "left", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "neon" },
  },
  home14: {
    sponsorGiveaways: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 8, frame: "print" },
    sponsorLeaderboard: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "neon" },
    dropCountdown: { page: "left", colStart: 1, colSpan: 12, rowStart: 9, rowSpan: 4, frame: "neon" },
  },
  home15: {
    hallOfFame: { page: "left", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 6, frame: "neon" },
    classicReplays: { page: "right", colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 12, frame: "stage" },
    vaultArchive: { page: "left", colStart: 1, colSpan: 12, rowStart: 7, rowSpan: 6, frame: "print" },
  },
};