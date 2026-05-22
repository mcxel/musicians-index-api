import fs from "node:fs";
import path from "node:path";

export type TmiVisualType =
  | "component"
  | "skin"
  | "background"
  | "environment"
  | "hud"
  | "prop"
  | "article-visual"
  | "sponsor-slot"
  | "admin-monitor"
  | "unknown";

export type TmiVisualTag =
  | "indoor"
  | "outdoor"
  | "lobby"
  | "room"
  | "auditorium"
  | "arena"
  | "magazine"
  | "homepage"
  | "artist"
  | "performer"
  | "fan"
  | "admin"
  | "sponsor"
  | "advertiser"
  | "game"
  | "hud"
  | "seat"
  | "billboard"
  | "control";

export type TmiVisualFragment = {
  fragmentId: string;
  label: string;
  inferredType: TmiVisualType;
  tags: TmiVisualTag[];
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
};

export type TmiVisualAssetRecord = {
  id: string;
  absolutePath: string;
  relativePath: string;
  ext: string;
  inferredType: TmiVisualType;
  tags: TmiVisualTag[];
  fragments: TmiVisualFragment[];
  transformCapabilities: Array<"recolor" | "swap" | "repurpose" | "reimagine">;
};

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);

function inferTypeFromPath(inputPath: string): TmiVisualType {
  const lower = inputPath.toLowerCase();
  if (lower.includes("hud") || lower.includes("overlay")) return "hud";
  if (lower.includes("skin")) return "skin";
  if (lower.includes("background") || lower.includes("bg")) return "background";
  if (
    lower.includes("venue") ||
    lower.includes("arena") ||
    lower.includes("lobby") ||
    lower.includes("room") ||
    lower.includes("auditorium")
  ) {
    return "environment";
  }
  if (lower.includes("article") || lower.includes("magazine") || lower.includes("news")) return "article-visual";
  if (lower.includes("sponsor") || lower.includes("ad")) return "sponsor-slot";
  if (lower.includes("admin") || lower.includes("monitor")) return "admin-monitor";
  if (lower.includes("prop") || lower.includes("item")) return "prop";
  if (lower.includes("component") || lower.includes("card") || lower.includes("panel")) return "component";
  return "unknown";
}

function inferTagsFromPath(inputPath: string): TmiVisualTag[] {
  const lower = inputPath.toLowerCase();
  const tags: TmiVisualTag[] = [];
  const push = (tag: TmiVisualTag) => {
    if (!tags.includes(tag)) tags.push(tag);
  };

  if (lower.includes("indoor")) push("indoor");
  if (lower.includes("outdoor")) push("outdoor");
  if (lower.includes("lobby")) push("lobby");
  if (lower.includes("room")) push("room");
  if (lower.includes("auditorium")) push("auditorium");
  if (lower.includes("arena")) push("arena");
  if (lower.includes("magazine") || lower.includes("news") || lower.includes("article")) push("magazine");
  if (lower.includes("home")) push("homepage");
  if (lower.includes("artist")) push("artist");
  if (lower.includes("performer")) push("performer");
  if (lower.includes("fan")) push("fan");
  if (lower.includes("admin")) push("admin");
  if (lower.includes("sponsor")) push("sponsor");
  if (lower.includes("advert")) push("advertiser");
  if (lower.includes("game") || lower.includes("contest")) push("game");
  if (lower.includes("hud") || lower.includes("overlay")) push("hud");
  if (lower.includes("seat")) push("seat");
  if (lower.includes("billboard")) push("billboard");
  if (
    lower.includes("button") ||
    lower.includes("slider") ||
    lower.includes("chevron") ||
    lower.includes("toggle") ||
    lower.includes("knob")
  ) {
    push("control");
  }

  return tags;
}

function syntheticFragment(assetId: string, inferredType: TmiVisualType, tags: TmiVisualTag[]): TmiVisualFragment[] {
  return [
    {
      fragmentId: `${assetId}:base`,
      label: "base-region",
      inferredType,
      tags,
      bounds: { x: 0, y: 0, width: 100, height: 100 },
      confidence: 0.52,
    },
  ];
}

function walkVisualFiles(dir: string, output: string[] = []): string[] {
  if (!fs.existsSync(dir)) return output;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkVisualFiles(fullPath, output);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) output.push(fullPath);
  }

  return output;
}

export function decomposeVisualAssets(rootDir: string): TmiVisualAssetRecord[] {
  const files = walkVisualFiles(rootDir);
  return files.map((absolutePath, index) => {
    const relativePath = absolutePath.replace(/\\/g, "/");
    const ext = path.extname(absolutePath).toLowerCase();
    const id = `vis-${String(index + 1).padStart(5, "0")}`;
    const inferredType = inferTypeFromPath(relativePath);
    const tags = inferTagsFromPath(relativePath);

    return {
      id,
      absolutePath,
      relativePath,
      ext,
      inferredType,
      tags,
      fragments: syntheticFragment(id, inferredType, tags),
      transformCapabilities: ["recolor", "swap", "repurpose", "reimagine"],
    };
  });
}
