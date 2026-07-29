import prisma from "@/lib/prisma";
import type { InternalTrustScore } from "./types";

/**
 * Honest placeholder TrustScore calculator.
 * Uses only real account age + verified-ish flags when present.
 * Never Math.random(). Never expose on public profiles.
 */
export async function computeInternalTrustScore(userId: string): Promise<InternalTrustScore> {
  const basis: string[] = [];

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userCreatedAt: true,
        emailVerified: true,
        canSubmitOfficialPlatformLinks: true,
        accountStatus: true,
        role: true,
      },
    });

    if (!user) {
      return { score: null, basis: ["user_not_found"], computable: false };
    }

    let score = 40;
    basis.push("baseline_40");

    const ageMs = Date.now() - new Date(user.userCreatedAt).getTime();
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    if (ageDays >= 365) {
      score += 25;
      basis.push("account_age_365d_+25");
    } else if (ageDays >= 90) {
      score += 15;
      basis.push("account_age_90d_+15");
    } else if (ageDays >= 30) {
      score += 8;
      basis.push("account_age_30d_+8");
    } else {
      basis.push(`account_age_${ageDays}d_no_bonus`);
    }

    if (user.emailVerified) {
      score += 15;
      basis.push("email_verified_+15");
    }

    if (user.canSubmitOfficialPlatformLinks) {
      score += 10;
      basis.push("official_links_flag_+10");
    }

    if (user.accountStatus === "suspended" || user.accountStatus === "banned") {
      score = Math.min(score, 15);
      basis.push(`account_status_${user.accountStatus}_cap_15`);
    }

    if (user.role === "ADMIN" || user.role === "STAFF") {
      score = Math.min(100, score + 5);
      basis.push("staff_role_+5_internal_only");
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      basis,
      computable: true,
    };
  } catch {
    return { score: null, basis: ["db_unavailable"], computable: false };
  }
}
