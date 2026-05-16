export type TmiHomepageIssueSkin = {
  issueId: string;
  monthTag: string;
  backgroundPalette: string[];
  rearOverlayPreset: string;
  frontOverlayPreset: string;
  mediaSet: string;
  billboardTheme: string;
  sponsorTheme: string;
};

const ISSUE_SKINS: TmiHomepageIssueSkin[] = [
  {
    issueId: "issue-current-week",
    monthTag: "current",
    backgroundPalette: ["#1f0f3d", "#0f4563", "#612087"],
    rearOverlayPreset: "neon-zigzag",
    frontOverlayPreset: "frame-crown",
    mediaSet: "top10-cypher",
    billboardTheme: "rankings",
    sponsorTheme: "retro-luxe"
  },
  {
    issueId: "issue-next-wave",
    monthTag: "next",
    backgroundPalette: ["#31205f", "#0086b7", "#7f1d76"],
    rearOverlayPreset: "starburst-grid",
    frontOverlayPreset: "frame-delta",
    mediaSet: "rising-artists",
    billboardTheme: "participation",
    sponsorTheme: "festival-neon"
  }
];

export function listHomepageIssueSkins(): TmiHomepageIssueSkin[] {
  return ISSUE_SKINS;
}

export function getHomepageIssueSkin(issueId: string): TmiHomepageIssueSkin | undefined {
  return ISSUE_SKINS.find((row) => row.issueId === issueId);
}
