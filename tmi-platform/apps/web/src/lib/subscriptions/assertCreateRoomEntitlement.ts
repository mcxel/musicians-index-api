/**
 * Server-side CREATE ROOM gate — Targets 2–3.
 * FREE→GOLD denied. PLATINUM+ allowed. Independent of ADMIN / role.
 * Progressive room caps are NOT defined in SubscriptionPlanEngine — only
 * createRoomEnabled is locked here until product canon defines platinum vs diamond limits.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveTierFromDb } from "@/lib/auth/resolveAuthoritativeTier";
import { resolveEntitlement } from "@/lib/subscriptions/SubscriptionEntitlementEngine";
import type { AccountType, SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";

const VALID_TIERS = new Set<string>([
  "free",
  "pro",
  "RUBY",
  "silver",
  "gold",
  "platinum",
  "diamond",
]);

function toSubscriptionTier(tier: string): SubscriptionTier {
  const t = tier.toLowerCase() === "ruby" ? "RUBY" : tier.toLowerCase();
  if (VALID_TIERS.has(t) || t === "RUBY") return t as SubscriptionTier;
  return "free";
}

function toAccountType(role: string | null | undefined): AccountType {
  const r = (role ?? "").toUpperCase();
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND") return "performer";
  return "fan";
}

export type CreateRoomEntitlementResult =
  | {
      ok: true;
      userId: string;
      email: string;
      tier: SubscriptionTier;
      accountType: AccountType;
      displayName: string;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
      code: "UNAUTHORIZED" | "ENTITLEMENT_DENIED";
      tier?: string;
    };

export async function assertCreateRoomEntitlement(
  req: NextRequest,
): Promise<CreateRoomEntitlementResult> {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) {
    return {
      ok: false,
      status: 401,
      error: "Sign in to create a room.",
      code: "UNAUTHORIZED",
    };
  }

  const dbUser = await prisma.user
    .findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        tier: true,
        role: true,
        displayName: true,
        name: true,
      },
    })
    .catch(() => null);

  if (!dbUser) {
    return {
      ok: false,
      status: 401,
      error: "Sign in to create a room.",
      code: "UNAUTHORIZED",
    };
  }

  const authoritative = resolveTierFromDb(dbUser.email ?? email, dbUser.tier);
  const tier = toSubscriptionTier(authoritative);
  const accountType = toAccountType(dbUser.role);
  // Entitlement is tier-only for createRoom — role must not grant bypass.
  const entitlement = resolveEntitlement(accountType, tier);

  if (!entitlement.createRoomEnabled) {
    return {
      ok: false,
      status: 403,
      error:
        "Room creation requires PLATINUM or DIAMOND subscription. FREE through GOLD cannot create member venues.",
      code: "ENTITLEMENT_DENIED",
      tier: authoritative,
    };
  }

  return {
    ok: true,
    userId: dbUser.id,
    email: dbUser.email ?? email,
    tier,
    accountType,
    displayName:
      dbUser.displayName ??
      dbUser.name ??
      (email.includes("@") ? email.split("@")[0] : email),
  };
}
