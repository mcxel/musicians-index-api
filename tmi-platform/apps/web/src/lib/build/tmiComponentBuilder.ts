import type { TmiVisualAssetRecord, TmiVisualTag, TmiVisualType } from "@/lib/build/tmiVisualDecomposer";

export type TmiBuiltArtifactKind =
  | "ui-component"
  | "skin-pack"
  | "background-layer"
  | "environment-piece"
  | "hud-layer"
  | "prop-instance"
  | "article-module"
  | "sponsor-module"
  | "admin-monitor-tile";

export type TmiBuiltArtifact = {
  id: string;
  sourceAssetId: string;
  kind: TmiBuiltArtifactKind;
  name: string;
  routeTargets: string[];
  styleTokenPack: string[];
  canBeRecolored: boolean;
  canBeRepurposed: boolean;
  canBeSwapped: boolean;
  canBeReimagined: boolean;
};

function mapTypeToKind(type: TmiVisualType): TmiBuiltArtifactKind {
  switch (type) {
    case "component":
      return "ui-component";
    case "skin":
      return "skin-pack";
    case "background":
      return "background-layer";
    case "environment":
      return "environment-piece";
    case "hud":
      return "hud-layer";
    case "prop":
      return "prop-instance";
    case "article-visual":
      return "article-module";
    case "sponsor-slot":
      return "sponsor-module";
    case "admin-monitor":
      return "admin-monitor-tile";
    default:
      return "ui-component";
  }
}

function inferRouteTargets(tags: TmiVisualTag[]): string[] {
  const routes = new Set<string>(["/home/1", "/home/1-2", "/home/2", "/home/3", "/home/4", "/home/5"]);
  if (tags.includes("artist")) routes.add("/artist");
  if (tags.includes("performer")) routes.add("/performers");
  if (tags.includes("fan")) routes.add("/fans");
  if (tags.includes("admin")) routes.add("/admin");
  if (tags.includes("sponsor")) routes.add("/sponsors");
  if (tags.includes("advertiser")) routes.add("/advertisers");
  if (tags.includes("lobby")) routes.add("/lobbies");
  if (tags.includes("room")) routes.add("/rooms");
  if (tags.includes("auditorium") || tags.includes("arena")) routes.add("/venues");
  if (tags.includes("magazine")) routes.add("/magazine");
  return [...routes];
}

export function buildTmiArtifacts(records: TmiVisualAssetRecord[]): TmiBuiltArtifact[] {
  return records.map((record, index) => {
    const artifact: TmiBuiltArtifact = {
      id: `artifact-${String(index + 1).padStart(5, "0")}`,
      sourceAssetId: record.id,
      kind: mapTypeToKind(record.inferredType),
      name: record.relativePath.split("/").pop() ?? record.id,
      routeTargets: inferRouteTargets(record.tags),
      styleTokenPack: ["tmi-neon-primary", "tmi-glow-cyan", "tmi-depth-shadow"],
      canBeRecolored: true,
      canBeRepurposed: true,
      canBeSwapped: true,
      canBeReimagined: true,
    };
    return artifact;
  });
}
