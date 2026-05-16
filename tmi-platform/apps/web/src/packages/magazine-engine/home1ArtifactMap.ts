export type Home1ArtifactType =
  | "face-slot"
  | "rank-number"
  | "genre-label"
  | "vote-button"
  | "view-button"
  | "cypher-badge"
  | "weekly-footer"
  | "hype-strip"
  | "stream-chip"
  | "updating-banner"
  | "nav-hotspot";

export type Home1Artifact = {
  artifactId: string;
  type: Home1ArtifactType;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  dataSource: string;
  routeTarget: string;
  fallbackRoute: string;
  motionPreset: "portalFloat" | "pulseGlow" | "tickerSweep" | "staggerPop" | "sparkBlink" | "none";
  analyticsEvent: string;
  label?: string;
  slotRole?: "crown" | "surround";
  requiresArtist?: boolean;
};

export const home1ArtifactMap: Home1Artifact[] = [
  {
    artifactId: "crown-face-slot",
    type: "face-slot",
    x: 50,
    y: 51,
    w: 31,
    h: 44,
    zIndex: 35,
    dataSource: "artistPool.genreRotation.rank1",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_crown_face_open",
    label: "Crown Face",
    slotRole: "crown",
    requiresArtist: true,
  },
  {
    artifactId: "surround-face-slot-2",
    type: "face-slot",
    x: 21,
    y: 25,
    w: 16,
    h: 23,
    zIndex: 30,
    dataSource: "artistPool.genreRotation.rank2",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_surround_face_open",
    label: "Rank 2 Face",
    slotRole: "surround",
    requiresArtist: true,
  },
  {
    artifactId: "surround-face-slot-3",
    type: "face-slot",
    x: 79,
    y: 25,
    w: 16,
    h: 23,
    zIndex: 30,
    dataSource: "artistPool.genreRotation.rank3",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_surround_face_open",
    label: "Rank 3 Face",
    slotRole: "surround",
    requiresArtist: true,
  },
  {
    artifactId: "surround-face-slot-4",
    type: "face-slot",
    x: 12,
    y: 57,
    w: 14,
    h: 20,
    zIndex: 28,
    dataSource: "artistPool.genreRotation.rank4",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_surround_face_open",
    label: "Rank 4 Face",
    slotRole: "surround",
    requiresArtist: true,
  },
  {
    artifactId: "surround-face-slot-5",
    type: "face-slot",
    x: 88,
    y: 57,
    w: 14,
    h: 20,
    zIndex: 28,
    dataSource: "artistPool.genreRotation.rank5",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_surround_face_open",
    label: "Rank 5 Face",
    slotRole: "surround",
    requiresArtist: true,
  },
  {
    artifactId: "surround-face-slot-6",
    type: "face-slot",
    x: 31,
    y: 75,
    w: 14,
    h: 20,
    zIndex: 28,
    dataSource: "artistPool.genreRotation.rank6",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_surround_face_open",
    label: "Rank 6 Face",
    slotRole: "surround",
    requiresArtist: true,
  },
  {
    artifactId: "surround-face-slot-7",
    type: "face-slot",
    x: 69,
    y: 75,
    w: 14,
    h: 20,
    zIndex: 28,
    dataSource: "artistPool.genreRotation.rank7",
    routeTarget: "/artists/[slug]",
    fallbackRoute: "/artist/[slug]",
    motionPreset: "portalFloat",
    analyticsEvent: "home1_surround_face_open",
    label: "Rank 7 Face",
    slotRole: "surround",
    requiresArtist: true,
  },
  {
    artifactId: "rank-strip",
    type: "rank-number",
    x: 10,
    y: 11,
    w: 18,
    h: 7,
    zIndex: 22,
    dataSource: "artistPool.genreRotation",
    routeTarget: "/charts",
    fallbackRoute: "/home/6",
    motionPreset: "tickerSweep",
    analyticsEvent: "home1_rank_strip_open",
    label: "Rank Number Strip",
  },
  {
    artifactId: "genre-label",
    type: "genre-label",
    x: 44,
    y: 12,
    w: 30,
    h: 7,
    zIndex: 24,
    dataSource: "genreRotation.current",
    routeTarget: "/charts",
    fallbackRoute: "/home/6",
    motionPreset: "pulseGlow",
    analyticsEvent: "home1_genre_label_open",
    label: "Genre Label",
  },
  {
    artifactId: "vote-chip",
    type: "vote-button",
    x: 34,
    y: 22,
    w: 33,
    h: 6,
    zIndex: 31,
    dataSource: "voteRuntime.current",
    routeTarget: "/vote/idol",
    fallbackRoute: "/home/1",
    motionPreset: "pulseGlow",
    analyticsEvent: "home1_vote_chip_open",
    label: "Vote Chip",
  },
  {
    artifactId: "view-chip",
    type: "view-button",
    x: 66,
    y: 63,
    w: 22,
    h: 6,
    zIndex: 31,
    dataSource: "artistPool.genreRotation.featured",
    routeTarget: "/artists",
    fallbackRoute: "/artists",
    motionPreset: "pulseGlow",
    analyticsEvent: "home1_view_chip_open",
    label: "View Chip",
  },
  {
    artifactId: "cypher-arena-badge",
    type: "cypher-badge",
    x: 41,
    y: 64,
    w: 19,
    h: 9,
    zIndex: 34,
    dataSource: "roomStatus.cypherArena",
    routeTarget: "/home/9",
    fallbackRoute: "/live/cypher",
    motionPreset: "sparkBlink",
    analyticsEvent: "home1_cypher_badge_open",
    label: "Cypher Arena Badge",
  },
  {
    artifactId: "weekly-cyphers-footer",
    type: "weekly-footer",
    x: 50,
    y: 94,
    w: 66,
    h: 7,
    zIndex: 32,
    dataSource: "issueRegistry.current",
    routeTarget: "/home/15",
    fallbackRoute: "/home/1",
    motionPreset: "tickerSweep",
    analyticsEvent: "home1_weekly_footer_open",
    label: "Weekly Cyphers Footer",
  },
  {
    artifactId: "hype-bot-strip",
    type: "hype-strip",
    x: 43,
    y: 82,
    w: 34,
    h: 6,
    zIndex: 31,
    dataSource: "bot.hype.stream",
    routeTarget: "/home/1",
    fallbackRoute: "/home/1",
    motionPreset: "tickerSweep",
    analyticsEvent: "home1_hype_strip_open",
    label: "Hype Bot Strip",
  },
  {
    artifactId: "stream-win-chip",
    type: "stream-chip",
    x: 77,
    y: 82,
    w: 22,
    h: 6,
    zIndex: 31,
    dataSource: "streaming.rewardState",
    routeTarget: "/home/13",
    fallbackRoute: "/home/13",
    motionPreset: "pulseGlow",
    analyticsEvent: "home1_stream_win_open",
    label: "Stream and Win Chip",
  },
  {
    artifactId: "crown-updating-banner",
    type: "updating-banner",
    x: 50,
    y: 18,
    w: 52,
    h: 6,
    zIndex: 33,
    dataSource: "crownRuntime.status",
    routeTarget: "/home/6",
    fallbackRoute: "/home/1",
    motionPreset: "tickerSweep",
    analyticsEvent: "home1_crown_updating_open",
    label: "Crown Updating Banner",
  },
  {
    artifactId: "hotspot-profile-nav",
    type: "nav-hotspot",
    x: 10,
    y: 5,
    w: 22,
    h: 8,
    zIndex: 40,
    dataSource: "nav.home",
    routeTarget: "/artists",
    fallbackRoute: "/home/1",
    motionPreset: "none",
    analyticsEvent: "home1_nav_profiles_open",
    label: "Profiles Nav Hotspot",
  },
  {
    artifactId: "hotspot-article-nav",
    type: "nav-hotspot",
    x: 34,
    y: 5,
    w: 22,
    h: 8,
    zIndex: 40,
    dataSource: "nav.home",
    routeTarget: "/articles/phase-c-artist",
    fallbackRoute: "/articles",
    motionPreset: "none",
    analyticsEvent: "home1_nav_article_open",
    label: "Article Nav Hotspot",
  },
  {
    artifactId: "hotspot-live-nav",
    type: "nav-hotspot",
    x: 58,
    y: 5,
    w: 22,
    h: 8,
    zIndex: 40,
    dataSource: "nav.home",
    routeTarget: "/live/1",
    fallbackRoute: "/home/3",
    motionPreset: "none",
    analyticsEvent: "home1_nav_live_open",
    label: "Live Nav Hotspot",
  },
];

export const home1FaceArtifacts = home1ArtifactMap.filter((artifact) => artifact.type === "face-slot");

export const home1CtaArtifacts = home1ArtifactMap.filter((artifact) => artifact.routeTarget && artifact.fallbackRoute);

export function validateHome1ArtifactContracts(artifacts: Home1Artifact[]): string[] {
  return artifacts.flatMap((artifact) => {
    const failures: string[] = [];

    if (!artifact.artifactId) failures.push("artifactId");
    if (!artifact.routeTarget) failures.push("routeTarget");
    if (!artifact.fallbackRoute) failures.push("fallbackRoute");
    if (!artifact.analyticsEvent) failures.push("analyticsEvent");

    return failures.length > 0
      ? [`${artifact.artifactId || "unknown-artifact"}: ${failures.join(", ")}`]
      : [];
  });
}

const validationErrors = validateHome1ArtifactContracts(home1ArtifactMap);
if (validationErrors.length > 0) {
  throw new Error(`Invalid Home1 artifact contracts: ${validationErrors.join(" | ")}`);
}
