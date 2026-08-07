export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { DiamondInviteEngine } from "@/lib/auth/DiamondInviteEngine";
import {
  normalizeAccountType,
  provisionRoleResources,
  type ProvisionStep,
} from "@/lib/auth/provisionRoleResources";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/provision
 * Rule 26 — creates real Prisma resources per role. Never returns fabricated OK.
 *
 * Body: { userId, roles?: ["FAN"|"PERFORMER"|...], accountType?: string, vipToken?: string }
 * Priority: roles[0] > accountType > default FAN
 */
export async function POST(req: NextRequest) {
  let body: { userId?: string; roles?: string[]; accountType?: string; vipToken?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* no body */
  }

  const { userId, vipToken } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId required", ok: false }, { status: 400 });
  }

  const accountType = normalizeAccountType(body.roles, body.accountType);

  let vipRedeemed = false;
  let vipRole: string | undefined;
  const vipSteps: ProvisionStep[] = [];

  // Core role resources first so wallet exists before VIP credit seed.
  const result = await provisionRoleResources(userId, accountType);

  if (vipToken) {
    const invite = DiamondInviteEngine.getInvite(vipToken);
    if (invite && invite.status === "active") {
      vipRedeemed = await DiamondInviteEngine.validateAndRedeem(vipToken, userId);
      vipRole = invite.assignedRole;
      if (vipRedeemed) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { tier: "DIAMOND" },
          });
          await prisma.wallet.update({
            where: { userId },
            data: { fanCredits: { increment: 5000 } },
          });
          await prisma.ledgerEntry.create({
            data: {
              userId,
              type: "CREDIT",
              amount: 5000,
              description: "Diamond invite credits",
              relatedId: `vip_${vipToken}`,
            },
          });
          vipSteps.push(
            { step: "vip_token_redeemed", status: "OK", role: vipRole, tier: "DIAMOND" },
            { step: "diamond_wallet_seeded", status: "OK", credits: 5000 },
          );
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          vipSteps.push({
            step: "vip_token_redeemed",
            status: "ERROR",
            error: message,
            role: vipRole,
          });
        }
      } else {
        vipSteps.push({
          step: "vip_token_redeemed",
          status: "ERROR",
          error: "invite_invalid_or_already_used",
        });
      }
    } else {
      vipSteps.push({
        step: "vip_token_redeemed",
        status: "SKIPPED",
        error: "invite_not_active",
      });
    }
  }

  const steps = [...result.steps, ...vipSteps];
  const vipHardFail = vipRedeemed && vipSteps.some((s) => s.status === "ERROR");
  const finalOk = result.ok && !vipHardFail;

  if (!finalOk) {
    return NextResponse.json(
      {
        ok: false,
        userId,
        accountType,
        completedAt: result.completedAt,
        steps,
        error: result.error ?? "provision_failed",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      userId,
      accountType,
      completedAt: result.completedAt,
      steps,
    },
    { status: 201 },
  );
}
