/**
 * POST /api/stripe/connect/onboard
 * Creates (or reuses) a Stripe Express Connect account + Account Link.
 * Persists wallet.stripeAccountId; stripeOnboarded flips true after return/refresh
 * when charges_enabled && payouts_enabled.
 *
 * ENV: STRIPE_SECRET_KEY. Dashboard: enable Connect → Express.
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId: user.id },
    });
  }

  let accountId = wallet.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { tmiUserId: user.id },
    });
    accountId = account.id;
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { stripeAccountId: accountId, stripeOnboarded: false },
    });
  }

  const { origin } = req.nextUrl;
  const refreshUrl = `${origin}/api/stripe/connect/return?refresh=1`;
  const returnUrl = `${origin}/api/stripe/connect/return`;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return NextResponse.json({
    url: accountLink.url,
    stripeAccountId: accountId,
    stripeOnboarded: wallet.stripeOnboarded,
  });
}
