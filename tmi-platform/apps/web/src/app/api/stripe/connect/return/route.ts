/**
 * GET /api/stripe/connect/return
 * Stripe Account Link return/refresh — syncs charges_enabled/payouts_enabled
 * onto wallet.stripeOnboarded, then redirects to performer commerce settings.
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const stripe = getStripe();
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  const { origin } = req.nextUrl;
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";

  const fallback = new URL("/hub/performer?notice=connect-incomplete", origin);

  if (!stripe || !email) {
    return NextResponse.redirect(fallback);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return NextResponse.redirect(fallback);

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    select: { id: true, stripeAccountId: true },
  });

  if (!wallet?.stripeAccountId) {
    return NextResponse.redirect(fallback);
  }

  try {
    const account = await stripe.accounts.retrieve(wallet.stripeAccountId);
    const ready = Boolean(account.charges_enabled && account.payouts_enabled);
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { stripeOnboarded: ready },
    });

    if (refresh && !ready) {
      // Re-issue Account Link when Stripe sends user back via refresh_url
      const link = await stripe.accountLinks.create({
        account: wallet.stripeAccountId,
        refresh_url: `${origin}/api/stripe/connect/return?refresh=1`,
        return_url: `${origin}/api/stripe/connect/return`,
        type: "account_onboarding",
      });
      return NextResponse.redirect(link.url);
    }

    const dest = ready
      ? new URL("/hub/performer?notice=connect-ready", origin)
      : new URL("/hub/performer?notice=connect-pending", origin);
    return NextResponse.redirect(dest);
  } catch {
    return NextResponse.redirect(fallback);
  }
}
