import { listVisualSlots } from "@/lib/visuals/TmiVisualSlotRegistry";
import { VisualMissingAssetDetector } from "@/lib/ai-visuals/VisualMissingAssetDetector";

export type VisualCoverageReport = {
  totalSlots: number;
  coveredSlots: number;
  missingSlots: number;
  coveragePercent: number;
};

export class VisualSlotCoverageEngine {
  static getCoverageReport(): VisualCoverageReport {
    const all = listVisualSlots();
    const missing = VisualMissingAssetDetector.listMissing();
    const total = all.length;
    const missingCount = missing.length;
    const covered = Math.max(0, total - missingCount);
    return {
      totalSlots: total,
      coveredSlots: covered,
      missingSlots: missingCount,
      coveragePercent: total === 0 ? 100 : Math.round((covered / total) * 100),
    };
  }
}
