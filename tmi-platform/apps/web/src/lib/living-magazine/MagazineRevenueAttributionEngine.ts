// MagazineRevenueAttributionEngine
// Tracks per-article ad/tip/conversion revenue — powers contributor payout calculations.

export interface RevenueRecord {
  contentId: string;
  contributorId: string;
  issueId?: string;
  adRevenue: number;
  tipRevenue: number;
  ticketRevenue: number;
  nftRevenue: number;
  merchandiseRevenue: number;
  totalRevenue: number;
  updatedAt: string;
}

const _records = new Map<string, RevenueRecord>();

export function getRecord(contentId: string): RevenueRecord | null {
  return _records.get(contentId) ?? null;
}

export function initRecord(contentId: string, contributorId: string, issueId?: string): void {
  if (_records.has(contentId)) return;
  _records.set(contentId, {
    contentId,
    contributorId,
    issueId,
    adRevenue: 0,
    tipRevenue: 0,
    ticketRevenue: 0,
    nftRevenue: 0,
    merchandiseRevenue: 0,
    totalRevenue: 0,
    updatedAt: new Date().toISOString(),
  });
}

type RevenueField = "adRevenue" | "tipRevenue" | "ticketRevenue" | "nftRevenue" | "merchandiseRevenue";

export function attributeRevenue(
  contentId: string,
  field: RevenueField,
  amount: number,
): void {
  const record = _records.get(contentId);
  if (!record) return;
  const updated = {
    ...record,
    [field]: record[field] + amount,
    updatedAt: new Date().toISOString(),
  };
  updated.totalRevenue = (
    updated.adRevenue +
    updated.tipRevenue +
    updated.ticketRevenue +
    updated.nftRevenue +
    updated.merchandiseRevenue
  );
  _records.set(contentId, updated);
}

export function getTopEarners(limit = 10): RevenueRecord[] {
  return Array.from(_records.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

export function getTotalPlatformRevenue(): number {
  let total = 0;
  for (const r of _records.values()) total += r.totalRevenue;
  return total;
}
