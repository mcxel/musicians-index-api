/**
 * Resolve a seller/creator membership tier for creator-commerce fee ladder.
 */

import { prisma } from "@/lib/prisma";
import {
  normalizeCommerceTier,
  type CommerceMembershipTier,
} from "@/lib/commerce/RevenueSplitEngine";

export async function resolveSellerCommerceTier(
  userId: string | null | undefined,
): Promise<CommerceMembershipTier> {
  if (!userId || userId === "guest") return "FREE";
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    return normalizeCommerceTier(user?.tier);
  } catch {
    return "FREE";
  }
}
