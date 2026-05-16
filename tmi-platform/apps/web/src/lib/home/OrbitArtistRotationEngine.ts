import { buildIssueSnapshot } from "@/lib/issues/IssueIntelligenceEngine";
import { getCrownRankRuntime, type CrownRankRuntimeEntry } from "./CrownRankRuntime";

export interface OrbitArtistRuntimeEntry extends CrownRankRuntimeEntry {
  orbitIndex: number;
}

function rotateEntries<T>(entries: T[], offset: number): T[] {
  if (!entries.length) return [];
  const normalizedOffset = ((offset % entries.length) + entries.length) % entries.length;
  return [...entries.slice(normalizedOffset), ...entries.slice(0, normalizedOffset)];
}

export function getOrbitArtistRotation(limit = 9): OrbitArtistRuntimeEntry[] {
  const issue = buildIssueSnapshot();
  const candidates = getCrownRankRuntime(limit + 1).filter((entry) => entry.rank > 1);
  const rotated = rotateEntries(candidates, issue.issueNumber);

  return rotated.slice(0, limit).map((entry, orbitIndex) => ({
    ...entry,
    orbitIndex,
  }));
}