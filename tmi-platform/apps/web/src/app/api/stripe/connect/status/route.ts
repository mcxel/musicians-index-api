/**
 * GET /api/stripe/connect/status
 * Rule 20 four-state Connect readiness for InstantPayout UI.
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  const userIdParam = req.nextUrl.searchParams.get("userId");

  if (!email && !userIdParam) {
    return NextResponse.json({
      state: "empty",
      connectReady: false,
      stripeAccountId: null,
      stripeOnboarded: false,
      message: "Sign in to connect Stripe payouts.",
    });
  }

  const user = userIdParam
    ? await prisma.user.findUnique({ where: { id: userIdParam }, select: { id: true, email: true } })
    : await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

  if (!user) {
    return NextResponse.json({
      state: "error",
      connectReady: false,
      stripeAccountId: null,
      stripeOnboarded: false,
      message: "Account not found.",
    }, { status: 404 });
  }

  // Session user may only inspect own Connect status unless querying self
  if (email && user.email && user.email.toLowerCase() !== email.toLowerCase() && !userIdParam) {
    // email path already resolved self
  }
  if (email && userIdParam) {
    const sessionUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!sessionUser || sessionUser.id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    select: {
      stripeAccountId: true,
      stripeOnboarded: true,
      availableBalance: true,
      pendingBalance: true,
    },
  });

  if (!wallet) {
    return NextResponse.json({
      state: "empty",
      connectReady: false,
      stripeAccountId: null,
      stripeOnboarded: false,
      availableBalanceCents: 0,
      pendingBalanceCents: 0,
      message: "No wallet yet. Earnings appear after the first cleared tip or sale.",
    });
  }

  // Live sync when account exists (ENV-gated by Stripe key)
  let onboarded = wallet.stripeOnboarded;
  const stripe = getStripe();
  if (stripe && wallet.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(wallet.stripeAccountId);
      const ready = Boolean(account.charges_enabled && account.payouts_enabled);
      if (ready !== wallet.stripeOnboarded) {
        await prisma.wallet.update({
          where: { userId: user.id },
          data: { stripeOnboarded: ready },
        });
        onboarded = ready;
      }
    } catch {
      // keep DB flag
    }
  }

  const connectReady = Boolean(wallet.stripeAccountId && onboarded);

  return NextResponse.json({
    state: wallet.stripeAccountId ? "data" : "empty",
    connectReady,
    stripeAccountId: wallet.stripeAccountId,
    stripeOnboarded: onboarded,
    availableBalanceCents: wallet.availableBalance,
    pendingBalanceCents: wallet.pendingBalance,
    message: connectReady
      ? "Stripe Connect ready — InstantPayout can transfer cleared funds."
      : wallet.stripeAccountId
        ? "Stripe Connect onboarding incomplete — payouts stay PENDING_CONNECT."
        : "Connect Stripe Express to enable artist payouts.",
  });
}
