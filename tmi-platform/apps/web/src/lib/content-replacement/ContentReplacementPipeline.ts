import {
  assetTruthRegistry,
  type AssetTruthRecord,
} from "@/lib/content-replacement/AssetTruthRegistry";
import { placeholderScanner } from "@/lib/content-replacement/PlaceholderScanner";

export interface ReplacementRecommendation {
  assetId: string;
  type: AssetTruthRecord["type"];
  fromStatus: AssetTruthRecord["status"];
  toStatus:
    | "user-uploaded"
    | "live-feed"
    | "article-owned"
    | "sponsor-owned"
    | "generated";
  reason: string;
}

class ContentReplacementPipeline {
  scanAndRecommend() {
    const records = assetTruthRegistry.list();
    const scan = placeholderScanner.scan(records);

    const recommendations: ReplacementRecommendation[] = scan.findings
      .map((finding) => assetTruthRegistry.get(finding.assetId))
      .filter((record): record is AssetTruthRecord => Boolean(record))
      .map((record) => {
        if (record.type === "artist") {
          return {
            assetId: record.assetId,
            type: record.type,
            fromStatus: record.status,
            toStatus: "live-feed" as const,
            reason: "Replace artist placeholder with live feed or uploaded profile media.",
          };
        }

        if (record.type === "billboard") {
          return {
            assetId: record.assetId,
            type: record.type,
            fromStatus: record.status,
            toStatus: "live-feed" as const,
            reason: "Billboard should render public room or performer live feed.",
          };
        }

        if (record.type === "sponsor") {
          return {
            assetId: record.assetId,
            type: record.type,
            fromStatus: record.status,
            toStatus: "sponsor-owned" as const,
            reason: "Sponsor card should use sponsor logo/product/video media.",
          };
        }

        if (record.type === "article" || record.type === "news") {
          return {
            assetId: record.assetId,
            type: record.type,
            fromStatus: record.status,
            toStatus: "article-owned" as const,
            reason: "Editorial card should use article-owned thumbnail/video.",
          };
        }

        return {
          assetId: record.assetId,
          type: record.type,
          fromStatus: record.status,
          toStatus: "generated" as const,
          reason: "Fallback to owned generated media when no live or owned source is available.",
        };
      });

    return {
      scanned: records.length,
      placeholderFindings: scan.findings,
      recommendations,
    };
  }
}

export const contentReplacementPipeline = new ContentReplacementPipeline();
