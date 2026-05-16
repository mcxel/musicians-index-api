import { listPlatformConnections } from "@/lib/core/tmiPlatformConnectionRegistry";

export type TmiDuplicateSystemIssue = {
  systemId: string;
  reason: string;
};

export function findDuplicateSystems(): TmiDuplicateSystemIssue[] {
  const seen = new Set<string>();
  const issues: TmiDuplicateSystemIssue[] = [];

  for (const item of listPlatformConnections()) {
    if (seen.has(item.systemId)) {
      issues.push({ systemId: item.systemId, reason: "duplicate-system-id" });
    } else {
      seen.add(item.systemId);
    }
  }

  return issues;
}
