export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

interface RateWindow {
  timestamps: number[];
}

const emailWindows = new Map<string, RateWindow>();
const supportWindows = new Map<string, RateWindow>();

function countWithin(timestamps: number[], windowMs: number): number {
  const now = Date.now();
  return timestamps.filter((t) => now - t < windowMs).length;
}

function pruneOld(timestamps: number[], windowMs: number): number[] {
  const now = Date.now();
  return timestamps.filter((t) => now - t < windowMs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string; type?: 'general' | 'support' };
    const { email, type = 'general' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const key = email.toLowerCase().trim();
    const now = Date.now();

    if (type === 'support') {
      const window = supportWindows.get(key) ?? { timestamps: [] };
      window.timestamps = pruneOld(window.timestamps, 24 * 60 * 60 * 1000);
      const count = window.timestamps.length;
      if (count >= 3) {
        const oldest = window.timestamps[0];
        const retryAfterMs = oldest + 24 * 60 * 60 * 1000 - now;
        return NextResponse.json({ allowed: false, retryAfterMs, reason: 'support_daily_limit' });
      }
      window.timestamps.push(now);
      supportWindows.set(key, window);
      return NextResponse.json({ allowed: true, remaining: 3 - count - 1 });
    }

    const window = emailWindows.get(key) ?? { timestamps: [] };
    window.timestamps = pruneOld(window.timestamps, 60 * 60 * 1000);
    const count = countWithin(window.timestamps, 60 * 60 * 1000);

    if (count >= 5) {
      const oldest = window.timestamps[0];
      const retryAfterMs = oldest + 60 * 60 * 1000 - now;
      return NextResponse.json({ allowed: false, retryAfterMs, reason: 'hourly_limit' });
    }

    window.timestamps.push(now);
    emailWindows.set(key, window);

    return NextResponse.json({ allowed: true, remaining: 5 - count - 1 });
  } catch (err) {
    console.error('[email/rate-check]', err);
    return NextResponse.json({ error: 'Rate check failed' }, { status: 500 });
  }
}
