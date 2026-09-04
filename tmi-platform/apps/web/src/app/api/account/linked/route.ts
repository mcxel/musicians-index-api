import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function authedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

function maskAccountId(raw: string): string {
  if (raw.length <= 6) return "••••••";
  return raw.slice(0, 3) + "•".repeat(Math.min(raw.length - 6, 8)) + raw.slice(-3);
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  spotify: "Spotify",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  github: "GitHub",
  discord: "Discord",
  tiktok: "TikTok",
};

// GET /api/account/linked — list linked OAuth providers (no tokens)
export async function GET(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [accounts, user] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      select: { id: true, provider: true, providerAccountId: true, type: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } }),
  ]);

  const hasPassword = Boolean(user?.passwordHash);
  const canUnlinkAll = hasPassword || accounts.length > 1;

  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      provider: a.provider,
      label: PROVIDER_LABELS[a.provider.toLowerCase()] ?? a.provider,
      maskedId: maskAccountId(a.providerAccountId),
      type: a.type,
      // An account is safe to unlink when: user has a password, OR there's another provider remaining
      canUnlink: hasPassword || accounts.filter((x) => x.provider !== a.provider).length > 0,
    })),
    hasPassword,
    canUnlinkAll,
  });
}

// DELETE /api/account/linked — unlink one provider
// body: { provider: string }
export async function DELETE(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { provider?: string };
  try {
    body = (await req.json()) as { provider?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { provider } = body;
  if (!provider) return NextResponse.json({ error: "provider is required." }, { status: 400 });

  const [accounts, user] = await Promise.all([
    prisma.account.findMany({ where: { userId }, select: { id: true, provider: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } }),
  ]);

  const target = accounts.find((a) => a.provider.toLowerCase() === provider.toLowerCase());
  if (!target) {
    return NextResponse.json({ error: "Provider not linked to this account." }, { status: 404 });
  }

  const hasPassword = Boolean(user?.passwordHash);
  const otherProviders = accounts.filter((a) => a.provider.toLowerCase() !== provider.toLowerCase());

  // Safety: prevent account lockout
  if (!hasPassword && otherProviders.length === 0) {
    return NextResponse.json(
      {
        error:
          "Cannot unlink your only sign-in method. Set a password first or connect another provider.",
        code: "LAST_AUTH_METHOD",
      },
      { status: 409 },
    );
  }

  await prisma.account.delete({ where: { id: target.id } });

  return NextResponse.json({ ok: true, unlinked: provider });
}
