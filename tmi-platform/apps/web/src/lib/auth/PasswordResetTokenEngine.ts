import crypto from "crypto";
import prisma from "@/lib/prisma";

export type PasswordResetTokenRecord = {
  email: string;
  tokenHash: string;
  expiresAt: number;
  usedAt?: number;
  createdAt: number;
  ip?: string;
  userAgent?: string;
};

const RESET_TOKEN_TTL_MS = 20 * 60 * 1000; // 20 minutes
// In-memory fallback for warm instances (avoids extra DB reads on same instance)
const resetTokenStore = new Map<string, PasswordResetTokenRecord[]>();

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function issuePasswordResetToken(params: {
  email: string;
  ip?: string;
  userAgent?: string;
}): { token: string; record: PasswordResetTokenRecord } {
  const email = params.email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = Date.now();

  const record: PasswordResetTokenRecord = {
    email,
    tokenHash,
    createdAt: now,
    expiresAt: now + RESET_TOKEN_TTL_MS,
    ip: params.ip,
    userAgent: params.userAgent,
  };

  const existing = resetTokenStore.get(email) ?? [];
  resetTokenStore.set(email, [record, ...existing].slice(0, 10));

  // Persist to Prisma asynchronously — non-blocking so the reset link
  // still works across serverless cold-starts on Vercel
  prisma.user
    .findUnique({ where: { email }, select: { id: true } })
    .then((user) => {
      if (!user) return;
      return prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: tokenHash, // store the hash, not the raw token
          expiresAt: new Date(now + RESET_TOKEN_TTL_MS),
          used: false,
        },
      });
    })
    .catch(() => {
      // Non-fatal: in-memory store covers same-instance requests
    });

  return { token, record };
}

export async function validatePasswordResetTokenFromDB(params: {
  email: string;
  token: string;
}): Promise<{ valid: boolean; reason?: "invalid" | "expired" | "used" }> {
  const tokenHash = hashToken(params.token);
  try {
    const user = await prisma.user.findUnique({
      where: { email: params.email.trim().toLowerCase() },
      select: { id: true },
    });
    if (!user) return { valid: false, reason: "invalid" };

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });
    if (!record || record.userId !== user.id) return { valid: false, reason: "invalid" };
    if (record.used) return { valid: false, reason: "used" };
    if (record.expiresAt < new Date()) return { valid: false, reason: "expired" };
    return { valid: true };
  } catch {
    return { valid: false, reason: "invalid" };
  }
}

export async function consumePasswordResetTokenFromDB(params: {
  email: string;
  token: string;
}): Promise<boolean> {
  const tokenHash = hashToken(params.token);
  try {
    const result = await prisma.passwordResetToken.updateMany({
      where: { token: tokenHash, used: false },
      data: { used: true },
    });
    return result.count > 0;
  } catch {
    return false;
  }
}

export function validatePasswordResetToken(params: {
  email: string;
  token: string;
}): { valid: boolean; reason?: "invalid" | "expired" | "used"; record?: PasswordResetTokenRecord } {
  const email = params.email.trim().toLowerCase();
  const tokenHash = hashToken(params.token);
  const records = resetTokenStore.get(email) ?? [];
  const match = records.find((r) => r.tokenHash === tokenHash);

  if (!match) return { valid: false, reason: "invalid" };
  if (match.usedAt) return { valid: false, reason: "used" };
  if (Date.now() > match.expiresAt) return { valid: false, reason: "expired" };

  return { valid: true, record: match };
}

export function consumePasswordResetToken(params: { email: string; token: string }): boolean {
  const email = params.email.trim().toLowerCase();
  const tokenHash = hashToken(params.token);
  const records = resetTokenStore.get(email) ?? [];
  const idx = records.findIndex((r) => r.tokenHash === tokenHash);
  if (idx === -1) return false;
  if (records[idx].usedAt) return false;

  records[idx] = { ...records[idx], usedAt: Date.now() };
  resetTokenStore.set(email, records);

  // Also mark as used in Prisma
  const tHash = tokenHash;
  prisma.passwordResetToken
    .updateMany({ where: { token: tHash, used: false }, data: { used: true } })
    .catch(() => {});

  return true;
}

export function purgeExpiredPasswordResetTokens(email?: string): void {
  const now = Date.now();
  if (email) {
    const key = email.trim().toLowerCase();
    const records = (resetTokenStore.get(key) ?? []).filter((r) => r.expiresAt > now);
    if (records.length) resetTokenStore.set(key, records);
    else resetTokenStore.delete(key);
    return;
  }

  for (const [key, records] of resetTokenStore.entries()) {
    const next = records.filter((r) => r.expiresAt > now);
    if (next.length) resetTokenStore.set(key, next);
    else resetTokenStore.delete(key);
  }
}
