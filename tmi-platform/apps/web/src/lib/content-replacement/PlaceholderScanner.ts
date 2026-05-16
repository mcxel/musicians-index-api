import type { AssetTruthRecord } from "@/lib/content-replacement/AssetTruthRegistry";

const PLACEHOLDER_PATTERNS = [
  "placeholder",
  "mock",
  "dummy",
  "fake",
  "sample",
  "temp",
  "seed",
  "test-image",
  "static-demo",
  "avatar-default",
] as const;

export interface PlaceholderScanFinding {
  assetId: string;
  matchedPattern: string;
  source: string;
}

export interface PlaceholderScanResult {
  totalScanned: number;
  findings: PlaceholderScanFinding[];
}

function findPattern(source: string): string | null {
  const lower = source.toLowerCase();
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (lower.includes(pattern)) return pattern;
  }
  return null;
}

export class PlaceholderScanner {
  scan(records: AssetTruthRecord[]): PlaceholderScanResult {
    const findings: PlaceholderScanFinding[] = [];

    for (const record of records) {
      const match = findPattern(`${record.source} ${record.assetId}`);
      if (!match) continue;
      findings.push({
        assetId: record.assetId,
        matchedPattern: match,
        source: record.source,
      });
    }

    return {
      totalScanned: records.length,
      findings,
    };
  }
}

export const placeholderScanner = new PlaceholderScanner();
