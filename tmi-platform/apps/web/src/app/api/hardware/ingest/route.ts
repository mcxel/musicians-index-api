import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

export const dynamic = 'force-dynamic';

/**
 * TMI HARDWARE INGESTION API
 * Endpoints for WPE WebKit/Raspberry Pi kiosks running OpenCV/cv2 to push physical venue data.
 */
export async function POST(req: NextRequest) {
  const hardwareId = req.headers.get('x-tmi-hardware-id');
  const venueSlug = req.headers.get('x-tmi-venue-slug');
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-client-ip') ?? 'unknown';

  // Aggressive DDoS protection for hardware endpoints.
  const rateLimit = checkRateLimit(`hardware:ingest:${clientIp}`, 100, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Hardware telemetry rate limit exceeded.' }, { status: 429 });
  }

  if (!hardwareId || !venueSlug) {
    return NextResponse.json({ error: 'Missing strict hardware identification headers.' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const telemetry = await req.json();
      void telemetry;
    } else {
      const blob = await req.blob();
      void blob;
    }

    return NextResponse.json({ ok: true, status: 'Ingested', engine: 'TMI_V2' }, { status: 200 });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'unknown_error';
    return NextResponse.json({ error: 'Hardware ingestion fault', details }, { status: 500 });
  }
}
