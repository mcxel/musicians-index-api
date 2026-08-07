/**
 * Locked Stripe point-pack SKUs (CoD-style + broke-friendly micro tiers).
 * Grants credit Wallet.fanCredits via webhook fulfillment.
 */

export type PointPackSku =
  | "points_099"
  | "points_199"
  | "points_499"
  | "points_999"
  | "points_1999";

export type PointPackDef = {
  sku: PointPackSku;
  /** Stripe product key in STRIPE_PRODUCTS */
  productKey:
    | "POINT_PACK_099"
    | "POINT_PACK_199"
    | "POINT_PACK_499"
    | "POINT_PACK_999"
    | "POINT_PACK_1999";
  name: string;
  priceCents: number;
  /** Points granted to Wallet.fanCredits */
  points: number;
  blurb: string;
};

/** Exact locked grants — do not change without Marcel sign-off. */
export const POINT_PACKS: readonly PointPackDef[] = [
  {
    sku: "points_099",
    productKey: "POINT_PACK_099",
    name: "Micro Starter",
    priceCents: 99,
    points: 100,
    blurb: "Broke-friendly impulse pack — best pts/$ among micros.",
  },
  {
    sku: "points_199",
    productKey: "POINT_PACK_199",
    name: "Micro Plus",
    priceCents: 199,
    points: 200,
    blurb: "Fair lift vs $0.99 — still collect on both micro tiers.",
  },
  {
    sku: "points_499",
    productKey: "POINT_PACK_499",
    name: "Small Pack",
    priceCents: 499,
    points: 575,
    blurb: "Small bulk with a light value bump.",
  },
  {
    sku: "points_999",
    productKey: "POINT_PACK_999",
    name: "Mid Pack",
    priceCents: 999,
    points: 1250,
    blurb: "Mid pack for cosmetics + event entry.",
  },
  {
    sku: "points_1999",
    productKey: "POINT_PACK_1999",
    name: "Large Pack",
    priceCents: 1999,
    points: 2800,
    blurb: "Large pack — best bulk value.",
  },
] as const;

export const POINT_PACK_BY_SKU: Record<PointPackSku, PointPackDef> = Object.fromEntries(
  POINT_PACKS.map((p) => [p.sku, p]),
) as Record<PointPackSku, PointPackDef>;

export function getPointPackBySku(sku: string | null | undefined): PointPackDef | null {
  if (!sku) return null;
  return POINT_PACK_BY_SKU[sku as PointPackSku] ?? null;
}

export function getPointPackByPriceCents(priceCents: number): PointPackDef | null {
  return POINT_PACKS.find((p) => p.priceCents === priceCents) ?? null;
}

/** Season pass one-time purchases → bonus fanCredits (in addition to pass ownership). */
export const SEASON_PASS_BONUS_POINTS: Record<string, number> = {
  fan: 500,
  artist: 1000,
  bundle: 1500,
};

export function seasonPassBonusPoints(passType: string | null | undefined): number {
  if (!passType) return SEASON_PASS_BONUS_POINTS.fan ?? 500;
  return SEASON_PASS_BONUS_POINTS[passType] ?? SEASON_PASS_BONUS_POINTS.fan ?? 500;
}
