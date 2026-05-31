export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;
function getDb() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

async function checkDb(): Promise<{ ok: boolean; latencyMs: number; detail: string }> {
  const t = Date.now();
  try {
    await getDb().$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - t, detail: "Neon PostgreSQL connected" };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - t, detail: e instanceof Error ? e.message : "DB error" };
  }
}

async function checkStripe(): Promise<{ ok: boolean; detail: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, detail: "STRIPE_SECRET_KEY not set" };
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return { ok: res.ok, detail: res.ok ? "Stripe balance OK" : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Stripe unreachable" };
  }
}

async function checkResend(): Promise<{ ok: boolean; detail: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, detail: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    return { ok: res.status !== 401, detail: res.ok ? "Resend API key valid" : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Resend unreachable" };
  }
}

async function checkDaily(): Promise<{ ok: boolean; detail: string }> {
  const key = process.env.DAILY_API_KEY;
  if (!key) return { ok: false, detail: "DAILY_API_KEY not set" };
  try {
    const res = await fetch("https://api.daily.co/v1/rooms?limit=1", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return { ok: res.ok, detail: res.ok ? "Daily.co API reachable" : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Daily.co unreachable" };
  }
}

export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [db, stripe, resend, daily] = await Promise.all([
    checkDb(),
    checkStripe(),
    checkResend(),
    checkDaily(),
  ]);

  const envCheck = {
    DATABASE_URL:    !!process.env.DATABASE_URL,
    JWT_SECRET:      !!process.env.JWT_SECRET,
    STRIPE_SECRET:   !!process.env.STRIPE_SECRET_KEY,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    RESEND_API_KEY:  !!process.env.RESEND_API_KEY,
    OPENAI_API_KEY:  !!process.env.OPENAI_API_KEY,
    DAILY_API_KEY:   !!process.env.DAILY_API_KEY,
  };

  const allOk = db.ok && stripe.ok;

  return NextResponse.json(
    {
      status: allOk ? "green" : "red",
      timestamp: new Date().toISOString(),
      checks: { db, stripe, resend, daily },
      env: envCheck,
    },
    { status: 200 }
  );
}
