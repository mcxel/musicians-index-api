/**
 * PriceSortAuthority — LAW: lowest eligible real price first everywhere.
 * Surfaces must sort via this module (or products.ts helpers that call it).
 * Never hard-code display order by vanity tier when prices disagree.
 */

export type PricedOffer = {
  id: string;
  priceCents: number;
  label?: string;
  eligible?: boolean;
};

/** Stable ASC by priceCents; ineligible offers drop unless includeIneligible. */
export function sortOffersLowestPriceFirst<T extends PricedOffer>(
  offers: readonly T[],
  opts?: { includeIneligible?: boolean },
): T[] {
  const pool = opts?.includeIneligible
    ? [...offers]
    : offers.filter((o) => o.eligible !== false);
  return pool.sort((a, b) => {
    if (a.priceCents !== b.priceCents) return a.priceCents - b.priceCents;
    return a.id.localeCompare(b.id);
  });
}

export function assertLowestPriceFirst(offers: readonly PricedOffer[]): {
  ok: boolean;
  firstViolation?: string;
} {
  let prev = -Infinity;
  for (const o of offers) {
    if (o.eligible === false) continue;
    if (o.priceCents < prev) {
      return {
        ok: false,
        firstViolation: `${o.id} @ ${o.priceCents} appears after higher price ${prev}`,
      };
    }
    prev = o.priceCents;
  }
  return { ok: true };
}

export const PriceSortAuthority = {
  sortOffersLowestPriceFirst,
  assertLowestPriceFirst,
};
