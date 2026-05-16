export type IssuePalette = {
  issueNumber: number;
  name: string;
  colors: [string, string, string, string];
  boardGradient: string;
  panelGradient: string;
  confettiColors: string[];
};

const ISSUE_FAMILIES: Array<Omit<IssuePalette, "issueNumber">> = [
  {
    name: "Issue 1",
    colors: ["#AA2DFF", "#00E5FF", "#FFD447", "#FF2DAA"],
    boardGradient:
      "radial-gradient(1200px 650px at 8% 2%, rgba(170,45,255,0.35), transparent 60%), radial-gradient(1200px 750px at 90% 8%, rgba(0,229,255,0.28), transparent 58%), linear-gradient(145deg, #11081f 0%, #1a0d2e 42%, #0d1730 100%)",
    panelGradient:
      "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
    confettiColors: ["#AA2DFF", "#00E5FF", "#FFD447", "#FF2DAA", "#FFFFFF"],
  },
  {
    name: "Issue 2",
    colors: ["#FF3040", "#FF8A00", "#24E1FF", "#A8FF2D"],
    boardGradient:
      "radial-gradient(1100px 640px at 3% 8%, rgba(255,48,64,0.3), transparent 60%), radial-gradient(1300px 760px at 96% 6%, rgba(36,225,255,0.3), transparent 57%), linear-gradient(145deg, #1c0a0d 0%, #2e1209 45%, #0f1c24 100%)",
    panelGradient:
      "linear-gradient(150deg, rgba(255,255,255,0.11), rgba(255,255,255,0.03))",
    confettiColors: ["#FF3040", "#FF8A00", "#24E1FF", "#A8FF2D", "#F8F8F8"],
  },
  {
    name: "Issue 3",
    colors: ["#2D5BFF", "#FFE047", "#A34BFF", "#38D66B"],
    boardGradient:
      "radial-gradient(1300px 650px at 10% 1%, rgba(45,91,255,0.32), transparent 62%), radial-gradient(1300px 760px at 92% 9%, rgba(255,224,71,0.22), transparent 55%), linear-gradient(150deg, #09122c 0%, #150f2f 40%, #112416 100%)",
    panelGradient:
      "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))",
    confettiColors: ["#2D5BFF", "#FFE047", "#A34BFF", "#38D66B", "#FFFFFF"],
  },
  {
    name: "Issue 4",
    colors: ["#FF2DAA", "#00C2B2", "#F5A524", "#3D4BC9"],
    boardGradient:
      "radial-gradient(1200px 630px at 5% 4%, rgba(255,45,170,0.32), transparent 60%), radial-gradient(1200px 760px at 95% 7%, rgba(0,194,178,0.25), transparent 57%), linear-gradient(145deg, #190919 0%, #132131 45%, #151931 100%)",
    panelGradient:
      "linear-gradient(150deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
    confettiColors: ["#FF2DAA", "#00C2B2", "#F5A524", "#3D4BC9", "#FFFFFF"],
  },
];

export function getIssuePalette(issueNumber: number): IssuePalette {
  const safeIssue = Number.isFinite(issueNumber) && issueNumber > 0 ? Math.floor(issueNumber) : 1;
  const family = ISSUE_FAMILIES[(safeIssue - 1) % ISSUE_FAMILIES.length] ?? ISSUE_FAMILIES[0];
  return { issueNumber: safeIssue, ...family };
}

export function getCategoryAccent(issueNumber: number, category: string): string {
  const palette = getIssuePalette(issueNumber);
  const map: Record<string, number> = {
    feature: 0,
    interview: 1,
    review: 2,
    news: 3,
    editorial: 0,
  };
  const index = map[category] ?? 1;
  return palette.colors[index] ?? palette.colors[0];
}
