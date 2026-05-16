import { getTrophy, getArtistTrophies } from "@/lib/trophy/TrophyEngine";

export interface TrophyTransferRecord {
  transferId: string;
  trophyId: string;
  fromArtistId: string;
  toArtistId: string;
  reason: string;
  transferredAt: string;
}

const transferLog: TrophyTransferRecord[] = [];
const ownerOverride = new Map<string, string>();

function gen(): string {
  return `ttr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function transferTrophy(
  trophyId: string,
  fromArtistId: string,
  toArtistId: string,
  reason: string,
): { ok: boolean; record?: TrophyTransferRecord; reason?: string } {
  const trophy = getTrophy(trophyId);
  if (!trophy) return { ok: false, reason: "trophy-not-found" };
  if (!trophy.transferable) return { ok: false, reason: "not-transferable" };

  const currentOwner = ownerOverride.get(trophyId) ?? trophy.awardedTo;
  if (currentOwner !== fromArtistId) return { ok: false, reason: "not-owner" };

  const record: TrophyTransferRecord = {
    transferId: gen(),
    trophyId,
    fromArtistId,
    toArtistId,
    reason,
    transferredAt: new Date().toISOString(),
  };
  transferLog.unshift(record);
  ownerOverride.set(trophyId, toArtistId);
  return { ok: true, record };
}

export function getCurrentOwner(trophyId: string): string | null {
  const override = ownerOverride.get(trophyId);
  if (override) return override;
  return getTrophy(trophyId)?.awardedTo ?? null;
}

export function getTransferHistory(trophyId: string): TrophyTransferRecord[] {
  return transferLog.filter((r) => r.trophyId === trophyId);
}

export function getArtistReceivedTrophies(artistId: string): string[] {
  return [...ownerOverride.entries()]
    .filter(([, owner]) => owner === artistId)
    .map(([trophyId]) => trophyId);
}

export function hasEverOwned(trophyId: string, artistId: string): boolean {
  const trophy = getTrophy(trophyId);
  if (trophy?.awardedTo === artistId) return true;
  return transferLog.some((r) => r.trophyId === trophyId && (r.fromArtistId === artistId || r.toArtistId === artistId));
}
