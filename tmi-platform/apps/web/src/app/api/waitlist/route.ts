export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ENTRIES: { email: string; role: string; joinedAt: string }[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json() as { email?: string; role?: string };
  if (!body.email || !body.email.includes('@')) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }
  const existing = ENTRIES.find(e => e.email.toLowerCase() === body.email!.toLowerCase());
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, message: "You're already on the waitlist." });
  }
  ENTRIES.push({ email: body.email, role: body.role ?? 'MEMBER', joinedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, position: ENTRIES.length, message: "You're on the waitlist!" });
}

export async function GET() {
  return NextResponse.json({ count: ENTRIES.length, roles: ENTRIES.reduce((acc, e) => { acc[e.role] = (acc[e.role] ?? 0) + 1; return acc; }, {} as Record<string, number>) });
}
