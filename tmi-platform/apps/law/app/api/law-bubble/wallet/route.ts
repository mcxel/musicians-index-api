import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/security/SecurityController";

// ── In-memory wallet store ────────────────────────────────────────────────────
// Replace with Prisma DB when DATABASE_URL is provisioned.
const userWallets = new Map<string, number>();

interface WalletTransaction {
  userId: string;
  type: "purchase" | "deduct";
  amount: number;
  balanceAfter: number;
  timestamp: number;
}

const transactions: WalletTransaction[] = [];

const CREDIT_PACKAGES = {
  starter:  { credits: 5,  bonusCredits: 0, priceCents: 500  },
  standard: { credits: 10, bonusCredits: 2, priceCents: 1000 },
  pro:      { credits: 20, bonusCredits: 5, priceCents: 2000 },
} as const;

type PackageId = keyof typeof CREDIT_PACKAGES;

// ── GET /api/law-bubble/wallet?userId= ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId || userId.length > 128) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const rl = enforceRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const balance = userWallets.get(userId) ?? 0;
  return NextResponse.json({ userId, balance });
}

// ── POST /api/law-bubble/wallet ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (action === "purchase") {
    return handlePurchase(body);
  }
  if (action === "deduct") {
    return handleDeduct(body);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

function handlePurchase(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { userId, packageId } = body as Record<string, unknown>;
  if (typeof userId !== "string" || typeof packageId !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!(packageId in CREDIT_PACKAGES)) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const pkg = CREDIT_PACKAGES[packageId as PackageId];
  const current = userWallets.get(userId) ?? 0;
  const added = pkg.credits + pkg.bonusCredits;
  const newBalance = current + added;
  userWallets.set(userId, newBalance);

  transactions.push({
    userId,
    type: "purchase",
    amount: added,
    balanceAfter: newBalance,
    timestamp: Date.now(),
  });

  // TODO: Replace mock with real Stripe charge before production.
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // await stripe.charges.create({ amount: pkg.priceCents, currency: 'usd', ... });

  return NextResponse.json({ userId, balance: newBalance, creditsAdded: added });
}

function handleDeduct(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { userId, amount } = body as Record<string, unknown>;
  if (typeof userId !== "string" || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const current = userWallets.get(userId) ?? 0;
  if (current < amount) {
    return NextResponse.json({ error: "Insufficient credits", balance: current }, { status: 402 });
  }

  const newBalance = current - amount;
  userWallets.set(userId, newBalance);

  transactions.push({
    userId,
    type: "deduct",
    amount,
    balanceAfter: newBalance,
    timestamp: Date.now(),
  });

  return NextResponse.json({ userId, balance: newBalance });
}
