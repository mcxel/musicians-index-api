import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

/**
 * POST /api/ingest/hardware-telemetry
 * Receives raw system health, CV2 stats, and stream metadata directly from 
 * Brick and Mortar venue hardware (Raspberry Pi, WPE WebKit Kiosks, Linux encoders).
 */
export async function POST(req: NextRequest) {
  const hardwareIp = req.headers.get('x-forwarded-for') ?? req.ip ?? 'unknown_ip';
  const hardwareToken = req.headers.get('x-tmi-hardware-token');

  // Strict Authentication for hardware endpoints
  if (!hardwareToken || hardwareToken !== process.env.TMI_HARDWARE_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized hardware node' }, { status: 401 });
  }

  // High frequency rate limit for telemetry (e.g. 60 pings per minute per device)
  const { allowed } = checkRateLimit(`hardware:telemetry:${hardwareIp}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Telemetry saturated' }, { status: 429 });
  }

  try {
    const payload = await req.json();
    const { venueId, cameraId, status, fps, temp, bitrate } = payload;

    if (!venueId || !cameraId) {
      return NextResponse.json({ error: 'Missing hardware identification' }, { status: 400 });
    }

    // In production, push this to a Redis stream or TimescaleDB for the Overseer Deck
    console.log(`[HARDWARE_INGEST] Venue: ${venueId} | Cam: ${cameraId} | FPS: ${fps} | Temp: ${temp}C`);

    // Optionally trigger alerts if hardware is failing
    let alert = null;
    if (temp > 80) alert = 'CRITICAL_TEMP_WARNING';
    if (fps < 15) alert = 'FRAME_DROP_DETECTED';

    return NextResponse.json({ 
      acknowledged: true, 
      actionRequired: alert 
    }, { status: 200 });
  } catch (error) {
    console.error('[HARDWARE_TELEMETRY_ERROR]', error);
    return NextResponse.json({ error: 'Ingest pipeline failed' }, { status: 500 });
  }
}