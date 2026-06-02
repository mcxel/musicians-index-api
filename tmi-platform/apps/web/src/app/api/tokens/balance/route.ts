import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ balance: 0 });
  }

  try {
    // TODO: Replace with real DB query (Prisma / Supabase / etc.)
    // Example: const user = await prisma.user.findUnique({ where: { id: userId }, select: { tmiTokens: true } });
    // For now return a seeded value based on userId so it's deterministic in demo
    const seed = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const balance = (seed % 8000) + 500;
    return NextResponse.json({ balance, userId });
  } catch (error) {
    return NextResponse.json({ balance: 0, error: "fetch_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, amount, reason } = body;

  if (!userId || typeof amount !== "number") {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  try {
    // TODO: Update balance in DB
    return NextResponse.json({ success: true, userId, credited: amount, reason });
  } catch (error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
