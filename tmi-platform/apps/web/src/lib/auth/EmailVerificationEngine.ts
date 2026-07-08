import crypto from "crypto";

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
  const record: EmailVerificationRecord = {
    email,
    tokenHash: hash(token),
    createdAt: Date.now(),
    expiresAt: Date.now() + EMAIL_VERIFY_TTL_MS,
  };

  const list = verifyStore.get(email) ?? [];
  verifyStore.set(email, [record, ...list].slice(0, 5));
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
