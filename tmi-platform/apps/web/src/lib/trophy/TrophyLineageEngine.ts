import { getTransferHistory, getCurrentOwner } from "@/lib/trophy/TrophyTransferEngine";
import { getTrophy } from "@/lib/trophy/TrophyEngine";

export interface TrophyLineageNode {
  artistId: string;
  displayName?: string;
  heldFrom: string;
  heldUntil?: string;
  method: "awarded" | "transferred";
}

export interface TrophyLineage {
  trophyId: string;
  trophyTitle: string;
  currentHolder: string | null;
  lineage: TrophyLineageNode[];
}

export function getTrophyLineage(trophyId: string): TrophyLineage {
  const trophy = getTrophy(trophyId);
  const transferHistory = getTransferHistory(trophyId);
  const currentHolder = getCurrentOwner(trophyId);

  const lineage: TrophyLineageNode[] = [];

  if (trophy) {
    lineage.push({
      artistId: trophy.awardedTo,
      heldFrom: trophy.earnedAt,
      heldUntil: transferHistory.length > 0 ? transferHistory[transferHistory.length - 1].transferredAt : undefined,
      method: "awarded",
    });
  }

  for (let i = transferHistory.length - 1; i >= 0; i--) {
    const t = transferHistory[i];
    const next = transferHistory[i - 1];
    lineage.push({
      artistId: t.toArtistId,
      heldFrom: t.transferredAt,
      heldUntil: next?.transferredAt,
      method: "transferred",
    });
  }

  return {
    trophyId,
    trophyTitle: trophy?.title ?? "Unknown Trophy",
    currentHolder,
    lineage,
  };
}

export function getPreviousHolders(trophyId: string): string[] {
  const lineage = getTrophyLineage(trophyId);
  const current = lineage.currentHolder;
  return lineage.lineage.map((n) => n.artistId).filter((id) => id !== current);
}

export function getLineageLength(trophyId: string): number {
  return getTrophyLineage(trophyId).lineage.length;
}
