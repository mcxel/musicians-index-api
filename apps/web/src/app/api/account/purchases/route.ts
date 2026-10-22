export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { listOwnedVenueSkins } from '@/lib/venue/VenueSkinCommerce';
import { listOwnedStoreItems } from '@/lib/commerce/StoreItemOwnershipEngine';
import { listArtistCommerceOwnershipForBuyer } from '@/lib/commerce/ArtistCommerceOwnership';

/**
 * GET /api/account/purchases
 * Real, canonical account purchase/ownership checkpoint — every purchase
 * fulfilled by the Stripe webhook (venue skins, media player chassis,
 * season passes, orders) surfaces here, keyed to the real authenticated
 * user. Never seeds fake data; an unauthenticated caller or a user with
 * zero purchases both get honest empty responses (Rule 20).
 */
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value ?? '';
  const email = req.cookies.get('tmi_user_email')?.value ?? '';

  if (!sessionId && !email) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(sessionId ? [{ id: sessionId }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
    select: {
      id: true,
      tier: true,
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const [venueSkins, storeItems, chassisOwnerships, seasonPasses, artistCommerceOwnerships, recentOrders] = await Promise.all([
    listOwnedVenueSkins(user.id).catch(() => []),
    listOwnedStoreItems(user.id).catch(() => []),
    prisma.mediaPlayerChassisOwnership.findMany({ where: { userId: user.id } }).catch(() => []),
    prisma.seasonPassOwnership.findMany({
      where: { userId: user.id, isActive: true },
      include: { seasonPass: { select: { name: true, tier: true, endDate: true } } },
    }).catch(() => []),
    listArtistCommerceOwnershipForBuyer(user.id).catch(() => []),
    prisma.order.findMany({
      where: { buyerUserId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        provider: true,
        amountCents: true,
        currency: true,
        status: true,
      },
    }).catch(() => []),
  ]);

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    tier: user.tier,
    subscriptionRenewsAt: user.stripeCurrentPeriodEnd,
    stripeConnected: Boolean(user.stripeCustomerId),
    ownedVenueSkins: venueSkins.filter((s) => s.owned),
    ownedStoreItems: storeItems,
    ownedChassis: chassisOwnerships.map((c) => ({
      chassisId: c.chassisId,
      unlockedVia: c.unlockedVia,
      purchasedAt: c.purchasedAt,
    })),
    seasonPasses: seasonPasses.map((sp) => ({
      name: sp.seasonPass.name,
      tier: sp.seasonPass.tier,
      endDate: sp.seasonPass.endDate,
      purchasedAt: sp.purchasedAt,
    })),
    // Durable digital entitlements from artist storefronts (digital
    // products, licensing packs, VIP passes) — physical/service purchases
    // (merch, shoutouts, meet & greets) remain in recentOrders below, not
    // here, since they're fulfillment obligations rather than owned access.
    ownedArtistCommerceItems: artistCommerceOwnerships.map((o) => ({
      productId: o.productId,
      productType: o.productType,
      productTitle: o.productTitle,
      artistId: o.artistId,
      priceCentsPaid: o.priceCentsPaid,
      currency: o.currency,
      status: o.status,
      acquiredAt: o.acquiredAt,
    })),
    recentOrders,
  });
}
