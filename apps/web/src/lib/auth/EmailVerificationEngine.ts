import crypto from "crypto";
import prisma from "@/lib/prisma";
import { isPreauthorizedLifetimeDiamondEmail } from "@/lib/promos/FounderDiamondPassEngine";
import { provisionRoleResources } from "@/lib/auth/provisionRoleResources";

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

function hash(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export async function issuePersistedEmailVerificationToken(emailRaw: string): Promise<{
  email: string;
  token: string;
  expiresAt: Date;
}> {
  const email = normalize(emailRaw);
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await prisma.verificationToken.create({
    data: { identifier: email, token: hash(token), expires: expiresAt },
  });

  return { email, token, expiresAt };
}

export async function validatePersistedEmailVerificationToken(
  emailRaw: string,
  token: string,
): Promise<{ ok: true; userId: string } | { ok: false; reason: "invalid" | "expired" | "account_missing" }> {
  const email = normalize(emailRaw);
  const record = await prisma.verificationToken.findUnique({
    where: { token: hash(token) },
  });

  if (!record || normalize(record.identifier) !== email) {
    return { ok: false, reason: "invalid" };
  }
  if (record.expires.getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user ? { ok: true, userId: user.id } : { ok: false, reason: "account_missing" };
}

export async function consumePersistedEmailVerificationToken(
  emailRaw: string,
  token: string,
  grantLifetimeDiamond = false,
): Promise<{ ok: true; userId: string } | { ok: false; reason: "invalid" | "expired" | "account_missing" }> {
  const email = normalize(emailRaw);
  const tokenHash = hash(token);

  return prisma.$transaction(async (tx) => {
    const record = await tx.verificationToken.findUnique({ where: { token: tokenHash } });
    if (!record || normalize(record.identifier) !== email) {
      return { ok: false, reason: "invalid" } as const;
    }
    if (record.expires.getTime() <= Date.now()) {
      return { ok: false, reason: "expired" } as const;
    }

    const user = await tx.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return { ok: false, reason: "account_missing" } as const;

    await tx.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        ...(grantLifetimeDiamond ? { tier: "DIAMOND" } : {}),
      },
    });
    await tx.verificationToken.delete({ where: { token: tokenHash } });
    return { ok: true, userId: user.id } as const;
  });
}

export async function verifyAndClaimEmailAddress(emailRaw: string, token: string) {
  const email = normalize(emailRaw);
  const tokenCheck = await validatePersistedEmailVerificationToken(email, token);

  if (!tokenCheck.ok) return { ok: false as const, reason: tokenCheck.reason };

  const claimLifetimeDiamond = isPreauthorizedLifetimeDiamondEmail(email);
  if (claimLifetimeDiamond) {
    const provision = await provisionRoleResources(
      tokenCheck.userId,
      ["FAN", "PERFORMER"],
      { preserveAccountState: true },
    );
    if (!provision.ok) return { ok: false as const, reason: "profile_provision_failed" };
  }

  return consumePersistedEmailVerificationToken(email, token, claimLifetimeDiamond);
}
