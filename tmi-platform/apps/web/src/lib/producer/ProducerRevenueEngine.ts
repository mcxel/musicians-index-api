export type RevenueStream = "license-basic" | "license-premium" | "license-exclusive" | "royalty" | "nft-sale" | "tip" | "ad-placement";

export interface ProducerRevenueEntry {
  entryId: string;
  producerId: string;
  stream: RevenueStream;
  amount: number;
  beatId?: string;
  licenseeId?: string;
  recordedAt: string;
}

export interface ProducerRevenueSummary {
  producerId: string;
  totalRevenue: number;
  byStream: Partial<Record<RevenueStream, number>>;
  topStream: RevenueStream | null;
  beatCount: number;
  periodStart: string;
  periodEnd: string;
}

const ledger: ProducerRevenueEntry[] = [];
const producerIndex = new Map<string, string[]>();

function gen(): string {
  return `prev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const PLATFORM_CUT = 0.10;

export function recordRevenue(
  producerId: string,
  stream: RevenueStream,
  grossAmount: number,
  opts: { beatId?: string; licenseeId?: string } = {},
): { entry: ProducerRevenueEntry; netAmount: number } {
  const netAmount = Math.round(grossAmount * (1 - PLATFORM_CUT) * 100) / 100;
  const entry: ProducerRevenueEntry = {
    entryId: gen(),
    producerId,
    stream,
    amount: netAmount,
    beatId: opts.beatId,
    licenseeId: opts.licenseeId,
    recordedAt: new Date().toISOString(),
  };
  ledger.unshift(entry);
  const list = producerIndex.get(producerId) ?? [];
  list.unshift(entry.entryId);
  producerIndex.set(producerId, list.slice(0, 1000));
  return { entry, netAmount };
}

export function getProducerRevenueSummary(
  producerId: string,
  since?: string,
): ProducerRevenueSummary {
  const ids = producerIndex.get(producerId) ?? [];
  const entries = ids
    .map((id) => ledger.find((e) => e.entryId === id)!)
    .filter(Boolean)
    .filter((e) => !since || e.recordedAt >= since);

  const byStream: Partial<Record<RevenueStream, number>> = {};
  const beatIds = new Set<string>();
  for (const e of entries) {
    byStream[e.stream] = (byStream[e.stream] ?? 0) + e.amount;
    if (e.beatId) beatIds.add(e.beatId);
  }

  const topStream = (Object.entries(byStream).sort(([, a], [, b]) => b - a)[0]?.[0] as RevenueStream) ?? null;
  const totalRevenue = entries.reduce((s, e) => s + e.amount, 0);

  return {
    producerId,
    totalRevenue,
    byStream,
    topStream,
    beatCount: beatIds.size,
    periodStart: since ?? entries.at(-1)?.recordedAt ?? new Date().toISOString(),
    periodEnd: entries[0]?.recordedAt ?? new Date().toISOString(),
  };
}

export function getPlatformProducerTotal(): number {
  return ledger.reduce((s, e) => s + e.amount, 0);
}

export function getTopProducers(limit = 5): Array<{ producerId: string; totalRevenue: number }> {
  const totals = new Map<string, number>();
  for (const e of ledger) totals.set(e.producerId, (totals.get(e.producerId) ?? 0) + e.amount);
  return [...totals.entries()].sort(([, a], [, b]) => b - a).slice(0, limit).map(([producerId, totalRevenue]) => ({ producerId, totalRevenue }));
}
