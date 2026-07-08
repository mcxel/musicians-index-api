import crypto from "crypto";
import prisma from "@/lib/prisma";

type EmailVerificationRecord = {
  email: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  verifiedAt?: number;
};

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const verifyStore = new Map<string, EmailVerificationRecord[]>();

function hash(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function issueEmailVerificationToken(emailRaw: string): { email: string; token: string; expiresAt: number } {
  const email = normalize(emailRaw);
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = hash(token);
  const record: EmailVerificationRecord = {
    email,
    tokenHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + EMAIL_VERIFY_TTL_MS,
  };

  const list = verifyStore.get(email) ?? [];
  verifyStore.set(email, [record, ...list].slice(0, 5));

  // Persist to Prisma for cross-instance verification in serverless environments.
  prisma.verificationToken.create({
    data: {
      identifier: email,
      token: tokenHash,
      expires: new Date(record.expiresAt),
    },
  }).catch(() => {
    // Non-fatal: in-memory verification still works on warm instances.
  });

  return { email, token, expiresAt: record.expiresAt };
}

export function verifyEmailToken(emailRaw: string, token: string): { ok: boolean; reason?: "invalid" | "expired" | "used" } {
  const email = normalize(emailRaw);
  const tokenHash = hash(token);
  const list = verifyStore.get(email) ?? [];
  const match = list.find((r) => r.tokenHash === tokenHash);

  if (!match) return { ok: false, reason: "invalid" };
  if (match.verifiedAt) return { ok: false, reason: "used" };
  if (Date.now() > match.expiresAt) return { ok: false, reason: "expired" };

  match.verifiedAt = Date.now();
  verifyStore.set(email, list);
  return { ok: true };
}

export async function verifyEmailTokenFromDB(emailRaw: string, token: string): Promise<{ ok: boolean; reason?: "invalid" | "expired" | "used" }> {
  const email = normalize(emailRaw);
  const tokenHash = hash(token);

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record || record.identifier !== email) {
      return { ok: false, reason: "invalid" };
    }

    if (record.expires < new Date()) {
      return { ok: false, reason: "expired" };
    }

    // Consume one-time token on successful verification.
    const consumed = await prisma.verificationToken.deleteMany({
      where: { token: tokenHash, identifier: email },
    });

    if (consumed.count === 0) {
      return { ok: false, reason: "used" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
