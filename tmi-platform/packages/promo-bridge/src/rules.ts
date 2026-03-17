import type { PlacementContext, ProductKey, PromoSlot } from "@tmi/contracts";

/**
 * Per-product rule definition. Keep it small + deterministic.
 */
export type PromoRule = {
  /** Disable this product completely */
  disabled?: boolean;

  /** Max impressions per session (simple cap) */
  maxPerSession?: number;

  /** Cooldown between impressions for this product */
  cooldownMs?: number;
};

export type PromoRules = Partial<Record<ProductKey, PromoRule>>;

export type ImpressionState = {
  shownThisSessionByProduct: Partial<Record<ProductKey, number>>;
  lastShownAtByProduct: Partial<Record<ProductKey, number>>;
};

export const DEFAULT_RULES: PromoRules = {
  // Example defaults — tweak later per product if you want:
  // "tmi": { maxPerSession: 3, cooldownMs: 30_000 },
};

export function createInitialImpressionState(): ImpressionState {
  return { shownThisSessionByProduct: {}, lastShownAtByProduct: {} };
}

export function canShowProduct(
  product: ProductKey,
  state: ImpressionState,
  rules: PromoRules = DEFAULT_RULES,
  nowMs: number = Date.now()
): boolean {
  const r = rules[product];
  if (!r) return true;
  if (r.disabled) return false;

  const shownCount = state.shownThisSessionByProduct[product] ?? 0;
  if (typeof r.maxPerSession === "number" && shownCount >= r.maxPerSession) return false;

  const last = state.lastShownAtByProduct[product];
  if (typeof r.cooldownMs === "number" && typeof last === "number") {
    if (nowMs - last < r.cooldownMs) return false;
  }

  return true;
}

export function recordImpression(
  product: ProductKey,
  state: ImpressionState,
  nowMs: number = Date.now()
): ImpressionState {
  const shown = (state.shownThisSessionByProduct[product] ?? 0) + 1;
  return {
    shownThisSessionByProduct: { ...state.shownThisSessionByProduct, [product]: shown },
    lastShownAtByProduct: { ...state.lastShownAtByProduct, [product]: nowMs },
  };
}

/**
 * Filter + rank candidates using rules + impression state.
 * Deterministic: stable sort by priority desc then id asc.
 */
export function applyPromoRules(params: {
  ctx: PlacementContext;
  candidates: PromoSlot[];
  rules?: PromoRules;
  state?: ImpressionState;
  nowMs?: number;
}): { chosen?: PromoSlot; state: ImpressionState } {
  const { candidates, rules = DEFAULT_RULES } = params;
  const nowMs = params.nowMs ?? Date.now();
  const state = params.state ?? createInitialImpressionState();

  const eligible = candidates.filter((s) => canShowProduct(s.product, state, rules, nowMs));

  eligible.sort((a, b) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pb !== pa) return pb - pa;
    return String(a.id).localeCompare(String(b.id));
  });

  const chosen = eligible[0];
  const nextState = chosen ? recordImpression(chosen.product, state, nowMs) : state;

  return { chosen, state: nextState };
}
