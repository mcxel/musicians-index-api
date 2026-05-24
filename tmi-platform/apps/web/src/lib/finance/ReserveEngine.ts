// lib/finance/ReserveEngine.ts — Infrastructure escrow + reserve management

export type ReserveType = "infrastructure" | "legal" | "refund_buffer" | "growth";

export type ReserveAllocation = {
  id: string;
  type: ReserveType;
  amountCents: number;
  sourceTransactionId?: string;
  description: string;
  createdAt: number;
};

export type ReserveRelease = {
  id: string;
  reserveType: ReserveType;
  amountCents: number;
  reason: string;
  approvedBy: string;
  releasedAt: number;
};

// Reserve target percentages of monthly platform revenue
export const RESERVE_TARGETS: Record<ReserveType, number> = {
  infrastructure: 0.10,  // 10% → server bills, DB, CDN
  legal:          0.05,  // 5%  → legal, compliance
  refund_buffer:  0.07,  // 7%  → chargeback risk
  growth:         0.03,  // 3%  → ads, growth experiments
};

const allocations: ReserveAllocation[] = [];
const releases: ReserveRelease[] = [];
let counter = 1;

export function allocateToReserve(
  type: ReserveType,
  amountCents: number,
  sourceTransactionId?: string,
  description = ""
): ReserveAllocation {
  const entry: ReserveAllocation = {
    id: `RSV-${Date.now()}-${String(counter++).padStart(4, "0")}`,
    type,
    amountCents,
    sourceTransactionId,
    description: description || `${type} reserve contribution`,
    createdAt: Date.now(),
  };
  allocations.push(entry);
  return entry;
}

export function getReserveBalance(type?: ReserveType): number {
  const alloc = type
    ? allocations.filter(a => a.type === type).reduce((s, a) => s + a.amountCents, 0)
    : allocations.reduce((s, a) => s + a.amountCents, 0);
  const released = type
    ? releases.filter(r => r.reserveType === type).reduce((s, r) => s + r.amountCents, 0)
    : releases.reduce((s, r) => s + r.amountCents, 0);
  return Math.max(0, alloc - released);
}

export function releaseReserve(
  type: ReserveType,
  amountCents: number,
  reason: string,
  approvedBy: string
): ReserveRelease | null {
  const balance = getReserveBalance(type);
  if (amountCents > balance) return null;
  const entry: ReserveRelease = {
    id: `RSV-REL-${Date.now()}-${String(counter++).padStart(4, "0")}`,
    reserveType: type,
    amountCents,
    reason,
    approvedBy,
    releasedAt: Date.now(),
  };
  releases.push(entry);
  return entry;
}

export function getReserveSummary(): Record<ReserveType, number> {
  return {
    infrastructure: getReserveBalance("infrastructure"),
    legal: getReserveBalance("legal"),
    refund_buffer: getReserveBalance("refund_buffer"),
    growth: getReserveBalance("growth"),
  };
}
