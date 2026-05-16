import type { AiGeneratedAssetRecord } from "./AiGeneratedAssetRegistry";

export type VisualQualityReport = {
  assetId: string;
  score: number;
  checks: {
    resolution: boolean;
    realism: boolean;
    brandStyle: boolean;
    layoutFit: boolean;
    integrity: boolean;
  };
  approved: boolean;
  reasons: string[];
};

const minScore = 70;
const reports = new Map<string, VisualQualityReport>();

export function evaluateVisualQuality(asset: AiGeneratedAssetRecord): VisualQualityReport {
  const checks = {
    resolution: asset.qualityScore >= 60,
    realism: !asset.tags.includes("low-realism"),
    brandStyle: asset.style.includes("tmi") || asset.style.includes("neon") || asset.style.includes("canon"),
    layoutFit: Boolean(asset.targetComponent && asset.targetRoute),
    integrity: Boolean(asset.outputRef || asset.prompt),
  };

  let score = 0;
  score += checks.resolution ? 20 : 0;
  score += checks.realism ? 20 : 0;
  score += checks.brandStyle ? 20 : 0;
  score += checks.layoutFit ? 20 : 0;
  score += checks.integrity ? 20 : 0;

  const reasons: string[] = [];
  if (!checks.resolution) reasons.push("resolution below threshold");
  if (!checks.realism) reasons.push("realism check failed");
  if (!checks.brandStyle) reasons.push("style not aligned with brand");
  if (!checks.layoutFit) reasons.push("layout fit missing route/component");
  if (!checks.integrity) reasons.push("asset integrity metadata missing");

  const report: VisualQualityReport = {
    assetId: asset.assetId,
    score,
    checks,
    approved: score >= minScore,
    reasons,
  };

  reports.set(asset.assetId, report);
  return report;
}

export function getQualityReport(assetId: string): VisualQualityReport | null {
  return reports.get(assetId) ?? null;
}

export function listQualityReports(): VisualQualityReport[] {
  return [...reports.values()].sort((a, b) => b.score - a.score);
}
