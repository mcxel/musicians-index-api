export const dynamic = "force-dynamic";
/**
 * GET /api/yo/releases/[ownerSlug]
 *
 * Returns all locked, for-sale YoPho cards owned by a given creator slug.
 * Used by YoReleaseShelf to display an artist's purchasable releases.
 *
 * Response: { releases: YoReleaseShelfItem[] }
 *
 * Rule 20: no fake data — only returns real cards from the card store
 * that have a locked, isForSale sale config.
 */

import { NextRequest, NextResponse } from "next/server";
import { listYoPhoCards } from "@/lib/yopho/YoPhoCardStore";
import type { YoCardLockPolicy } from "@/lib/yopho/YoCardLockEngine";

export interface YoReleaseShelfItem {
  cardId: string;
  title: string;
  artistDisplay: string;
  coverArtUrl: string | null;
  priceCents: number;
  currency: string;
  editionLimit: number | null;
  soldCount: number;
  includesRawExport: boolean;
  productKind: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { ownerSlug: string } },
) {
  const { ownerSlug } = params;
  if (!ownerSlug) {
    return NextResponse.json({ releases: [] });
  }

  // In-memory store — swap for DB query once cards are persisted
  const allCards = listYoPhoCards(200);

  const releases: YoReleaseShelfItem[] = [];

  for (const card of allCards) {
    // Match by ownerKey (slug or id format)
    const keyMatch =
      card.ownerKey === ownerSlug ||
      card.slug === ownerSlug ||
      card.documentJson?.slug === ownerSlug;

    if (!keyMatch) continue;

    const lockPolicy: YoCardLockPolicy | undefined = card.documentJson?.lockPolicy;
    if (!lockPolicy || lockPolicy.state !== "LOCKED") continue;
    if (!lockPolicy.sale?.isForSale) continue;

    const sale = lockPolicy.sale;

    // Skip sold-out editions
    if (sale.editionLimit !== null && sale.soldCount >= sale.editionLimit) continue;

    releases.push({
      cardId: card.cardId,
      title: card.documentJson?.title ?? card.displayName ?? "Untitled Release",
      artistDisplay: card.displayName ?? ownerSlug,
      coverArtUrl: null, // Cover art is embedded in layers — resolved by client
      priceCents: sale.priceCents,
      currency: sale.currency ?? "USD",
      editionLimit: sale.editionLimit,
      soldCount: sale.soldCount,
      includesRawExport: sale.includesRawExport,
      productKind: lockPolicy.productKind,
    });
  }

  return NextResponse.json({ releases });
}
